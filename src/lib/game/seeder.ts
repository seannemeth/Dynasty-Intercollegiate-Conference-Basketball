// ============================================================
// League Seeder — idempotent league initialization
// Called once after league creation
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { D1_SCHOOLS, CONFERENCES } from '@/data/d1_schools';
import { generateRoster, generateRecruit } from '@/data/name_generator';

const RECRUITS_PER_LEAGUE = 300; // ~1 per team × stars distribution
const STARS_DISTRIBUTION = [
  { stars: 5, count: 5 },
  { stars: 4, count: 25 },
  { stars: 3, count: 80 },
  { stars: 2, count: 120 },
  { stars: 1, count: 70 },
];

const HOME_STATES = [
  'AL','AZ','AR','CA','CO','CT','FL','GA','IL','IN','IA','KS','KY','LA',
  'MD','MA','MI','MN','MS','MO','NE','NJ','NM','NY','NC','OH','OK','OR',
  'PA','SC','TN','TX','VA','WA','WI','DC'
];

export async function seedLeague(
  supabase: SupabaseClient,
  league_id: string
): Promise<{ teams_seeded: number; players_seeded: number; recruits_seeded: number }> {

  // ── 1. Check idempotency ──
  const { data: existingTeams } = await supabase
    .from('league_teams')
    .select('id')
    .eq('league_id', league_id)
    .limit(1);

  if (existingTeams && existingTeams.length > 0) {
    const count = await supabase.from('league_teams').select('id', { count: 'exact', head: true }).eq('league_id', league_id);
    return { teams_seeded: count.count || 0, players_seeded: 0, recruits_seeded: 0 };
  }

  // ── 2. Seed schools lookup ──
  // Ensure schools exist (upsert by name)
  const schoolUpserts = D1_SCHOOLS.map(s => ({
    name: s.name,
    short_name: s.short_name,
    abbreviation: s.abbreviation,
    conference: s.conference,
    prestige: s.prestige,
    color_primary: s.color_primary,
    color_secondary: s.color_secondary,
    city: s.city,
    state: s.state,
    arena_name: s.arena_name,
    arena_capacity: s.arena_capacity,
  }));

  await supabase.from('schools').upsert(schoolUpserts, { onConflict: 'name', ignoreDuplicates: true });

  // ── 3. Load school IDs ──
  const { data: schools } = await supabase.from('schools').select('id, name, prestige, conference');
  if (!schools) throw new Error('Schools not found');
  const schoolMap = new Map(schools.map(s => [s.name, s]));

  // ── 4. Seed conferences ──
  const confInserts = CONFERENCES.map(c => ({
    league_id,
    name: c,
    short_name: c.replace('Conference', '').trim(),
    tier: getConferenceTier(c),
  }));

  await supabase.from('conferences').upsert(confInserts, { onConflict: 'league_id,name', ignoreDuplicates: true });
  const { data: confs } = await supabase.from('conferences').select('id, name').eq('league_id', league_id);
  const confMap = new Map((confs || []).map(c => [c.name, c.id]));

  // ── 5. Seed league_teams + conference_members ──
  const COACH_FIRST = ['Tom', 'Bill', 'John', 'Mike', 'Chris', 'Dan', 'Bob', 'Dave', 'Steve', 'Mark', 'Kevin', 'Jim', 'Tony', 'Rick', 'Scott', 'Brad', 'Jeff', 'Tim', 'Eric', 'Larry'];
  const COACH_LAST = ['Johnson', 'Williams', 'Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Clark', 'Lewis', 'Lee', 'Walker'];
  const OFFENSE_STYLES = ['uptempo', 'balanced', 'halfcourt', 'dribble_drive'];
  const DEFENSE_STYLES = ['man', 'zone_2-3', 'zone_3-2', 'press', 'hybrid'];

  const teamInserts = D1_SCHOOLS.map((school, i) => {
    const s = schoolMap.get(school.name);
    if (!s) return null;
    const seed = i * 997;
    return {
      league_id,
      school_id: s.id,
      coach_first_name: COACH_FIRST[i % COACH_FIRST.length],
      coach_last_name: COACH_LAST[(i * 3) % COACH_LAST.length],
      coach_prestige: s.prestige,
      coach_offense_style: OFFENSE_STYLES[i % OFFENSE_STYLES.length],
      coach_defense_style: DEFENSE_STYLES[i % DEFENSE_STYLES.length],
      prestige: s.prestige,
      facilities_level: Math.min(10, Math.max(1, s.prestige * 2)),
      program_momentum: 40 + s.prestige * 8,
      fan_interest: 30 + s.prestige * 12,
      nil_bank: 200000 * s.prestige,
      nil_weekly_income: 20000 * s.prestige,
      team_overall: 60 + s.prestige * 5,
      wins: 0,
      losses: 0,
    };
  }).filter(Boolean);

  const { data: insertedTeams, error: teamErr } = await supabase
    .from('league_teams')
    .insert(teamInserts)
    .select('id, school_id');

  if (teamErr || !insertedTeams) throw new Error(`Team insert failed: ${teamErr?.message}`);

  // Reload schools with IDs mapped to league_team IDs
  const schoolIdToTeamId = new Map(insertedTeams.map(t => [t.school_id, t.id]));

  // ── 6. Seed team finances ──
  const financeInserts = insertedTeams.map(t => {
    const school = schools.find(s => s.id === t.school_id);
    const prestige = school?.prestige || 3;
    return {
      league_id,
      team_id: t.id,
      season: 1,
      nil_bank: 200000 * prestige,
      nil_weekly_income: 20000 * prestige,
      nil_weekly_cap: 100000 * prestige,
      nil_committed_weekly: 0,
      operations_budget: 500000 * prestige,
    };
  });

  await supabase.from('team_finances').insert(financeInserts);

  // ── 7. Seed team recruiting state ──
  const recStateInserts = insertedTeams.map(t => ({
    league_id,
    team_id: t.id,
    season: 1,
    scholarships_total: 13,
    scholarships_used: 10, // start with 10 players, 3 scholarships to fill
    scholarships_offered: 0,
  }));

  await supabase.from('team_recruiting_state').insert(recStateInserts);

  // ── 8. Seed conference members ──
  const confMemberInserts: any[] = [];
  for (const school of D1_SCHOOLS) {
    const s = schoolMap.get(school.name);
    if (!s) continue;
    const teamId = schoolIdToTeamId.get(s.id);
    const confId = confMap.get(school.conference);
    if (!teamId || !confId) continue;
    confMemberInserts.push({ league_id, conference_id: confId, team_id: teamId });
  }
  if (confMemberInserts.length > 0) {
    await supabase.from('conference_members').insert(confMemberInserts);
  }

  // ── 9. Seed rosters (13 players per team) ──
  let totalPlayers = 0;
  const BATCH_SIZE = 50;
  const allPlayerInserts: any[] = [];

  for (let idx = 0; idx < D1_SCHOOLS.length; idx++) {
    const school = D1_SCHOOLS[idx];
    const s = schoolMap.get(school.name);
    if (!s) continue;
    const teamId = schoolIdToTeamId.get(s.id);
    if (!teamId) continue;

    const roster = generateRoster(idx * 1000 + 7, s.prestige);
    const JERSEY_NUMS = new Set<number>();

    const playerInserts = roster.map((p, i) => {
      let jersey = p.jersey_number;
      while (JERSEY_NUMS.has(jersey)) jersey = (jersey % 45) + 1;
      JERSEY_NUMS.add(jersey);

      return {
        league_id,
        team_id: teamId,
        first_name: p.first_name,
        last_name: p.last_name,
        jersey_number: jersey,
        position: p.position,
        overall: p.overall,
        potential: p.potential,
        dev_trait: p.dev_trait,
        attr_speed: p.attr_speed,
        attr_ball_handling: p.attr_ball_handling,
        attr_shooting_2pt: p.attr_shooting_2pt,
        attr_shooting_3pt: p.attr_shooting_3pt,
        attr_defense: p.attr_defense,
        attr_rebounding: p.attr_rebounding,
        attr_iq: p.attr_iq,
        attr_athleticism: p.attr_athleticism,
        attr_free_throw: p.attr_free_throw,
        attr_passing: p.attr_passing,
        year: p.year,
        is_starter: i < 5,
        depth_chart_pos: i,
        morale: 70 + Math.floor(Math.random() * 20),
      };
    });

    allPlayerInserts.push(...playerInserts);
    totalPlayers += playerInserts.length;
  }

  // Batch insert players
  for (let i = 0; i < allPlayerInserts.length; i += BATCH_SIZE) {
    const batch = allPlayerInserts.slice(i, i + BATCH_SIZE);
    const { error: playerErr } = await supabase.from('players').insert(batch);
    if (playerErr) console.error('Player batch error:', playerErr.message);
  }

  // ── 10. Seed recruits pool ──
  let totalRecruits = 0;
  const recruitInserts: any[] = [];
  let recruitSeed = 42000;

  for (const { stars, count } of STARS_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      const r = generateRecruit(recruitSeed++, stars as 1 | 2 | 3 | 4 | 5);
      const state = HOME_STATES[Math.floor(Math.random() * HOME_STATES.length)];

      // Get template or use inline
      recruitInserts.push({
        league_id,
        // template_id will be null — inline seeded
        first_name: r.first_name,
        last_name: r.last_name,
        position: r.position,
        stars,
        overall: r.overall,
        potential: r.potential,
        dev_trait: r.dev_trait,
        home_state: state,
        pref_proximity: Math.floor(Math.random() * 80) + 10,
        pref_prestige: Math.floor(Math.random() * 80) + 10,
        pref_nil: Math.floor(Math.random() * 80) + 10,
        pref_playing_time: Math.floor(Math.random() * 80) + 10,
        pref_coach_stability: Math.floor(Math.random() * 80) + 10,
        status: 'available',
        commit_score: 0,
      });
      totalRecruits++;
    }
  }

  // Batch insert recruits
  for (let i = 0; i < recruitInserts.length; i += BATCH_SIZE) {
    const batch = recruitInserts.slice(i, i + BATCH_SIZE);
    await supabase.from('league_recruits').insert(batch);
  }

  // ── 11. Generate season schedule ──
  await generateSchedule(supabase, league_id, insertedTeams, confMap, schools);

  // ── 12. Create initial team_week_state (week 1) ──
  const twsInserts = insertedTeams.map(t => ({
    league_id,
    team_id: t.id,
    week: 1,
    recruiting_points_budget: 100,
    nil_budget_this_week: 50000,
  }));
  await supabase.from('team_week_state').upsert(twsInserts, { onConflict: 'league_id,team_id,week', ignoreDuplicates: true });

  // ── 13. Initial season stats rows ──
  const statsInserts = insertedTeams.map(t => ({
    league_id,
    team_id: t.id,
    season: 1,
    wins: 0, losses: 0, conf_wins: 0, conf_losses: 0,
    points_scored: 0, points_allowed: 0, total_games: 0,
  }));
  await supabase.from('team_season_stats').upsert(statsInserts, { onConflict: 'league_id,team_id,season', ignoreDuplicates: true });

  return { teams_seeded: insertedTeams.length, players_seeded: totalPlayers, recruits_seeded: totalRecruits };
}

async function generateSchedule(
  supabase: SupabaseClient,
  league_id: string,
  teams: Array<{ id: string; school_id: string }>,
  confMap: Map<string, string>,
  schools: Array<{ id: string; name: string; prestige: number; conference: string }>
) {
  const schoolIdToConf = new Map(schools.map(s => [s.id, s.conference]));
  const confTeams = new Map<string, string[]>(); // conf_id -> [team_id]

  for (const team of teams) {
    const conf = schoolIdToConf.get(team.school_id);
    if (!conf) continue;
    const confId = confMap.get(conf);
    if (!confId) continue;
    if (!confTeams.has(confId)) confTeams.set(confId, []);
    confTeams.get(confId)!.push(team.id);
  }

  const gameInserts: any[] = [];
  const SEASON = 1;

  // ── Non-conference games: weeks 1-4 (2 games per team per week) ──
  const teamIds = teams.map(t => t.id);
  const shuffled = [...teamIds].sort(() => Math.random() - 0.5);

  for (let week = 1; week <= 4; week++) {
    const paired = new Set<string>();
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const home = shuffled[i];
      const away = shuffled[i + 1];
      if (home === away || paired.has(home) || paired.has(away)) continue;
      paired.add(home);
      paired.add(away);

      gameInserts.push({
        league_id, season: SEASON, week,
        game_type: 'non_conf',
        home_team_id: home, away_team_id: away,
        neutral_site: false, is_played: false,
      });
    }
  }

  // ── Conference games: weeks 5-18 (2 conf games per week) ──
  for (const [, cfTeams] of confTeams) {
    if (cfTeams.length < 2) continue;

    // Round robin within conference
    const pairs: [string, string][] = [];
    for (let i = 0; i < cfTeams.length; i++) {
      for (let j = i + 1; j < cfTeams.length; j++) {
        pairs.push([cfTeams[i], cfTeams[j]]);
      }
    }

    let week = 5;
    const pairsPerWeek = 2;

    for (let i = 0; i < pairs.length; i++) {
      const [home, away] = pairs[i];
      const gameWeek = week + Math.floor(i / pairsPerWeek);
      if (gameWeek > 18) break;

      gameInserts.push({
        league_id, season: SEASON, week: Math.min(18, gameWeek),
        game_type: 'conference',
        home_team_id: home, away_team_id: away,
        neutral_site: false, is_played: false,
      });
    }
  }

  // Batch insert schedule
  const BATCH = 200;
  for (let i = 0; i < gameInserts.length; i += BATCH) {
    const batch = gameInserts.slice(i, i + BATCH);
    await supabase.from('schedule_games').insert(batch);
  }
}

function getConferenceTier(conf: string): number {
  const p4 = ['SEC', 'ACC', 'Big Ten', 'Big 12'];
  const major = ['American Athletic', 'Atlantic 10', 'Mountain West', 'West Coast'];
  if (p4.includes(conf)) return 1;
  if (major.includes(conf)) return 2;
  return 3;
}
