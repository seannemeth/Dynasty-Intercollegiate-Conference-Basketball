// Supabase Edge Function: seed-league
// POST /functions/v1/seed-league
// Body: { league_id: string }
// Requires service role key

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { league_id } = await req.json();
    if (!league_id) return new Response(JSON.stringify({ error: 'league_id required' }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    );

    // Verify league exists
    const { data: league } = await supabase.from('leagues').select('id, name').eq('id', league_id).single();
    if (!league) return new Response(JSON.stringify({ error: 'League not found' }), { status: 404, headers: corsHeaders });

    // Check idempotency
    const { count } = await supabase.from('league_teams').select('*', { count: 'exact', head: true }).eq('league_id', league_id);
    if (count && count > 0) {
      return new Response(JSON.stringify({ message: 'Already seeded', teams: count }), { headers: corsHeaders });
    }

    // ── Seed schools ──
    const d1Schools = await getD1Schools();
    await supabase.from('schools').upsert(
      d1Schools.map(s => ({
        name: s.name, short_name: s.short_name, abbreviation: s.abbreviation,
        conference: s.conference, prestige: s.prestige,
        color_primary: s.color_primary, color_secondary: s.color_secondary,
        city: s.city, state: s.state, arena_name: s.arena_name, arena_capacity: s.arena_capacity,
      })),
      { onConflict: 'name', ignoreDuplicates: true }
    );

    const { data: schools } = await supabase.from('schools').select('id, name, prestige, conference');
    const schoolMap = new Map(schools!.map(s => [s.name, s]));

    // ── Seed conferences ──
    const conferences = [...new Set(d1Schools.map(s => s.conference))];
    await supabase.from('conferences').upsert(
      conferences.map(c => ({
        league_id, name: c, short_name: c.replace(' Conference', '').trim(),
        tier: ['SEC','ACC','Big Ten','Big 12'].includes(c) ? 1 : ['American Athletic','Atlantic 10','Mountain West','West Coast'].includes(c) ? 2 : 3,
      })),
      { onConflict: 'league_id,name', ignoreDuplicates: true }
    );

    const { data: confs } = await supabase.from('conferences').select('id, name').eq('league_id', league_id);
    const confMap = new Map(confs!.map(c => [c.name, c.id]));

    // ── Seed teams ──
    const teamInserts = d1Schools.map((school, i) => {
      const s = schoolMap.get(school.name);
      if (!s) return null;
      return {
        league_id, school_id: s.id,
        coach_first_name: COACH_NAMES[i % COACH_NAMES.length][0],
        coach_last_name: COACH_NAMES[i % COACH_NAMES.length][1],
        coach_prestige: s.prestige,
        prestige: s.prestige,
        facilities_level: Math.min(10, s.prestige * 2),
        program_momentum: 40 + s.prestige * 8,
        fan_interest: 30 + s.prestige * 12,
        nil_bank: 200000 * s.prestige,
        nil_weekly_income: 20000 * s.prestige,
        team_overall: 60 + s.prestige * 5,
      };
    }).filter(Boolean);

    const { data: insertedTeams } = await supabase.from('league_teams').insert(teamInserts).select('id, school_id');
    if (!insertedTeams) throw new Error('Failed to insert teams');

    const schoolIdToTeamId = new Map(insertedTeams.map(t => [t.school_id, t.id]));

    // ── Conference members ──
    const confMembers = d1Schools.map(school => {
      const s = schoolMap.get(school.name);
      if (!s) return null;
      const teamId = schoolIdToTeamId.get(s.id);
      const confId = confMap.get(school.conference);
      if (!teamId || !confId) return null;
      return { league_id, conference_id: confId, team_id: teamId };
    }).filter(Boolean);

    await supabase.from('conference_members').insert(confMembers);

    // ── Finances + rec state + season stats ──
    const finInserts = insertedTeams.map(t => {
      const school = schools!.find(s => s.id === t.school_id);
      const p = school?.prestige || 3;
      return { league_id, team_id: t.id, season: 1, nil_bank: 200000*p, nil_weekly_income: 20000*p, nil_weekly_cap: 100000*p, nil_committed_weekly: 0, operations_budget: 500000*p };
    });
    await supabase.from('team_finances').insert(finInserts);

    const recInserts = insertedTeams.map(t => ({
      league_id, team_id: t.id, season: 1, scholarships_total: 13, scholarships_used: 10,
    }));
    await supabase.from('team_recruiting_state').insert(recInserts);

    const statsInserts = insertedTeams.map(t => ({
      league_id, team_id: t.id, season: 1,
      wins: 0, losses: 0, conf_wins: 0, conf_losses: 0, points_scored: 0, points_allowed: 0, total_games: 0,
    }));
    await supabase.from('team_season_stats').insert(statsInserts);

    // ── Seed rosters ──
    let totalPlayers = 0;
    const allPlayers: any[] = [];

    for (let idx = 0; idx < d1Schools.length; idx++) {
      const school = d1Schools[idx];
      const s = schoolMap.get(school.name);
      if (!s) continue;
      const teamId = schoolIdToTeamId.get(s.id);
      if (!teamId) continue;
      const roster = generateRoster(idx * 1000 + 7, s.prestige);
      roster.forEach((p, i) => {
        allPlayers.push({ league_id, team_id: teamId, ...p, is_starter: i < 5, depth_chart_pos: i, morale: 70 + Math.floor(Math.random() * 20) });
        totalPlayers++;
      });
    }

    for (let i = 0; i < allPlayers.length; i += 100) {
      await supabase.from('players').insert(allPlayers.slice(i, i + 100));
    }

    // ── Seed recruits ──
    const recruits: any[] = [];
    const dist = [{stars:5,count:5},{stars:4,count:25},{stars:3,count:80},{stars:2,count:120},{stars:1,count:70}];
    const states = ['AL','AZ','AR','CA','CO','FL','GA','IL','IN','OH','TX','NC','VA','WA','NY','MI','KY','TN','PA','NJ'];
    let rseed = 42000;

    for (const { stars, count } of dist) {
      for (let i = 0; i < count; i++) {
        const r = generateRecruit(rseed++, stars as any);
        recruits.push({
          league_id, first_name: r.first_name, last_name: r.last_name,
          position: r.position, stars, overall: r.overall, potential: r.potential, dev_trait: r.dev_trait,
          home_state: states[rseed % states.length],
          pref_proximity: 20+Math.floor(Math.random()*60), pref_prestige: 20+Math.floor(Math.random()*60),
          pref_nil: 20+Math.floor(Math.random()*60), pref_playing_time: 20+Math.floor(Math.random()*60),
          pref_coach_stability: 20+Math.floor(Math.random()*60),
          status: 'available', commit_score: 0,
        });
      }
    }

    for (let i = 0; i < recruits.length; i += 100) {
      await supabase.from('league_recruits').insert(recruits.slice(i, i + 100));
    }

    // ── Generate schedule ──
    await seedSchedule(supabase, league_id, insertedTeams, confMap, schools!, d1Schools, schoolMap);

    // ── Advance league to preseason ──
    await supabase.from('leagues').update({ phase: 'preseason', current_week: 1 }).eq('id', league_id);

    // ── Audit log ──
    await supabase.from('league_audit_log').insert({
      league_id, actor_id: null, action: 'seed_league',
      payload: { teams: insertedTeams.length, players: totalPlayers, recruits: recruits.length },
    });

    return new Response(JSON.stringify({
      success: true,
      teams_seeded: insertedTeams.length,
      players_seeded: totalPlayers,
      recruits_seeded: recruits.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Seed error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});

async function seedSchedule(supabase: any, league_id: string, teams: any[], confMap: Map<string, string>, schools: any[], d1Schools: any[], schoolMap: Map<string, any>) {
  const schoolIdToConf = new Map(d1Schools.map(s => {
    const db = schoolMap.get(s.name);
    return db ? [db.id, s.conference] : null;
  }).filter(Boolean) as [string, string][]);

  const confTeams = new Map<string, string[]>();
  for (const team of teams) {
    const conf = schoolIdToConf.get(team.school_id);
    if (!conf) continue;
    const confId = confMap.get(conf);
    if (!confId) continue;
    if (!confTeams.has(confId)) confTeams.set(confId, []);
    confTeams.get(confId)!.push(team.id);
  }

  const games: any[] = [];
  const teamIds = teams.map(t => t.id);

  // Non-conf weeks 1-4
  const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
  for (let week = 1; week <= 4; week++) {
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      games.push({ league_id, season: 1, week, game_type: 'non_conf', home_team_id: shuffled[i], away_team_id: shuffled[i+1], neutral_site: false, is_played: false });
    }
  }

  // Conf weeks 5-18
  for (const [, cfTeams] of confTeams) {
    if (cfTeams.length < 2) continue;
    const pairs: [string,string][] = [];
    for (let i = 0; i < cfTeams.length; i++) {
      for (let j = i+1; j < cfTeams.length; j++) pairs.push([cfTeams[i], cfTeams[j]]);
    }
    let week = 5;
    for (let i = 0; i < pairs.length; i++) {
      const w = week + Math.floor(i / 2);
      if (w > 18) break;
      games.push({ league_id, season: 1, week: w, game_type: 'conference', home_team_id: pairs[i][0], away_team_id: pairs[i][1], neutral_site: false, is_played: false });
    }
  }

  for (let i = 0; i < games.length; i += 200) {
    await supabase.from('schedule_games').insert(games.slice(i, i+200));
  }
}

const COACH_NAMES: [string, string][] = [
  ['Tom', 'Johnson'], ['Bill', 'Williams'], ['John', 'Smith'], ['Mike', 'Brown'],
  ['Chris', 'Davis'], ['Dan', 'Miller'], ['Bob', 'Wilson'], ['Dave', 'Moore'],
  ['Steve', 'Taylor'], ['Mark', 'Anderson'], ['Kevin', 'Thomas'], ['Jim', 'Jackson'],
  ['Tony', 'White'], ['Rick', 'Harris'], ['Scott', 'Martin'], ['Brad', 'Thompson'],
  ['Jeff', 'Clark'], ['Tim', 'Lewis'], ['Eric', 'Lee'], ['Larry', 'Walker'],
  ['Greg', 'Hall'], ['Brian', 'Allen'], ['Sean', 'Young'], ['Pat', 'King'],
  ['Matt', 'Wright'], ['Ken', 'Lopez'], ['Don', 'Hill'], ['Gary', 'Scott'],
];

// Inline simplified versions of generate functions for edge function
// (avoids import complexity in Deno)
function generateRoster(seed: number, prestige: number) {
  const positions = ['PG','PG','SG','SG','SF','SF','PF','PF','C','C','SG','SF','PF'];
  const years = ['SR','SR','JR','JR','JR','SO','SO','SO','FR','FR','FR','FR','GR'];
  return positions.map((pos, i) => generatePlayer(seed + i * 31, prestige, i, pos, years[i]));
}

function generatePlayer(seed: number, prestige: number, index: number, position: string, year: string) {
  const rand = seededRand(seed * 997 + index * 13);
  const { first, last } = genName(seed + index);
  const prestigeBonus = (prestige - 3) * 5;
  const yearBonus = ['FR','SO','JR','SR','GR'].indexOf(year) * 2;
  const overall = clamp(65 + prestigeBonus + yearBonus + (rand() - 0.5) * 20, 55, 89);
  const potential = clamp(overall + (4 - ['FR','SO','JR','SR','GR'].indexOf(year)) * 4 + rand() * 10, overall, 95);
  const dr = rand(); const dev_trait = dr > 0.97 ? 'elite' : dr > 0.90 ? 'star' : dr > 0.70 ? 'impact' : 'normal';
  const BIASES: any = { PG: {bh:15,sp:10,iq:10,pass:15,reb:-10}, SG: {s2:10,s3:10,sp:5,ath:5}, SF: {ath:8,def:5,s2:5}, PF: {reb:12,def:8,ath:5,bh:-8,s3:-10}, C: {reb:18,def:12,sp:-10,bh:-15,s3:-15} };
  const b = BIASES[position] || {};
  return { first_name: first, last_name: last, position, year, overall, potential, dev_trait,
    attr_speed: clamp(overall+(b.sp||0)+(rand()-0.5)*20,40,99), attr_ball_handling: clamp(overall+(b.bh||0)+(rand()-0.5)*20,40,99),
    attr_shooting_2pt: clamp(overall+(b.s2||0)+(rand()-0.5)*16,40,99), attr_shooting_3pt: clamp(overall-5+(b.s3||0)+(rand()-0.5)*24,40,99),
    attr_defense: clamp(overall-3+(b.def||0)+(rand()-0.5)*20,40,99), attr_rebounding: clamp(overall-5+(b.reb||0)+(rand()-0.5)*20,40,99),
    attr_iq: clamp(overall+(b.iq||0)+(rand()-0.5)*16,40,99), attr_athleticism: clamp(overall+(b.ath||0)+(rand()-0.5)*20,40,99),
    attr_free_throw: clamp(overall-5+(rand()-0.5)*30,40,99), attr_passing: clamp(overall-5+(b.pass||0)+(rand()-0.5)*20,40,99),
    jersey_number: Math.floor(rand()*45)+1,
  };
}

function generateRecruit(seed: number, stars: number) {
  const rand = seededRand(seed * 1234);
  const positions = ['PG','SG','SF','PF','C'];
  const position = positions[Math.floor(rand() * positions.length)];
  const ranges: any = {5:[87,95],4:[78,86],3:[70,77],2:[63,69],1:[55,62]};
  const [mn, mx] = ranges[stars] || [60,70];
  const overall = clamp(mn + Math.floor(rand()*(mx-mn+1)), mn, mx);
  const potential = clamp(overall + Math.floor(rand()*10)+5, overall, 99);
  const dr = rand(); const dev_trait = stars>=5||dr>0.97 ? 'elite' : stars>=4||dr>0.88 ? 'star' : stars>=3||dr>0.65 ? 'impact' : 'normal';
  const { first, last } = genName(seed);
  return { first_name: first, last_name: last, position, overall, potential, dev_trait };
}

function seededRand(seed: number) {
  let s = seed;
  return () => { s += 0x6D2B79F5; let z = s; z = Math.imul(z^(z>>>15),z|1); z ^= z+Math.imul(z^(z>>>7),z|61); return ((z^(z>>>14))>>>0)/4294967296; };
}
function clamp(v: number, mn: number, mx: number) { return Math.max(mn, Math.min(mx, Math.round(v))); }

const FIRSTS = ['Jaylen','Marcus','DeShawn','Tremaine','Kendrick','Darius','Malik','Elijah','Jordan','Tyler','Cameron','Brandon','Isaiah','Zion','Caleb','Trevon','Devin','Alonzo','Jalen','Dante','Javon','Trey','Rodney','Curtis','Derrick','Antoine','Kevin','Patrick','Chase','Drew','Austin','Ryan','Connor','Mason','Logan','Hunter','Dylan','Ethan','Andrew','Nathan','Cole','Luke','Jake','Alex','Michael','James'];
const LASTS = ['Johnson','Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Lewis','Lee','Walker','Hall','Allen','Young','King','Wright','Lopez','Hill','Scott','Green','Adams','Baker','Nelson','Carter','Mitchell','Roberts','Turner','Reed','Cook','Morgan','Bell','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Watson','Brooks'];

function genName(seed: number) {
  const r = seededRand(seed * 31337);
  return { first: FIRSTS[Math.floor(r()*FIRSTS.length)], last: LASTS[Math.floor(r()*LASTS.length)] };
}

async function getD1Schools(): Promise<any[]> {
  try {
    const mod = await import('./d1_data.json', { assert: { type: 'json' } });
    return Array.isArray(mod.default) ? mod.default : [];
  } catch {
    return [];
  }
}
