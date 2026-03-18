// Supabase Edge Function: process-week
// POST /functions/v1/process-week
// Body: { league_id: string }
// Requires service role key OR valid commissioner JWT

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { league_id } = await req.json();
    if (!league_id) return new Response(JSON.stringify({ error: 'league_id required' }), { status: 400, headers: corsHeaders });

    // Use service role for all DB writes during simulation
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    );

    // Optionally verify caller is commissioner (if using user JWT)
    const authHeader = req.headers.get('authorization');
    if (authHeader && !authHeader.includes('service_role')) {
      const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { authorization: authHeader } } });
      const { data: user } = await userClient.auth.getUser();
      if (user?.user) {
        const { data: member } = await supabase.from('league_members')
          .select('role').eq('league_id', league_id).eq('user_id', user.user.id).single();
        if (!member || !['commissioner','co_commish'].includes(member.role)) {
          return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403, headers: corsHeaders });
        }
      }
    }

    // ── Load league ──
    const { data: league, error: leagueErr } = await supabase.from('leagues').select('*').eq('id', league_id).single();
    if (!league) return new Response(JSON.stringify({ error: 'League not found' }), { status: 404, headers: corsHeaders });

    const week = league.current_week;
    const season = league.season;

    // ── Idempotency check ──
    const { data: existing } = await supabase.from('week_processing_log')
      .select('id, status').eq('league_id', league_id).eq('season', season).eq('week', week).single();

    if (existing?.status === 'completed') {
      return new Response(JSON.stringify({ message: 'Already processed', week }), { headers: corsHeaders });
    }
    if (existing?.status === 'processing') {
      return new Response(JSON.stringify({ message: 'Currently processing', week }), { status: 409, headers: corsHeaders });
    }

    // ── Insert processing lock ──
    const { error: lockErr } = await supabase.from('week_processing_log')
      .insert({ league_id, season, week, status: 'processing' });

    if (lockErr) {
      return new Response(JSON.stringify({ error: 'Concurrent processing detected' }), { status: 409, headers: corsHeaders });
    }

    try {
      const result = await runWeekSimulation(supabase, league_id, league, week, season);

      await supabase.from('week_processing_log').update({
        status: 'completed', games_simmed: result.gamesSimmed, completed_at: new Date().toISOString(),
      }).eq('league_id', league_id).eq('season', season).eq('week', week);

      // Audit log
      await supabase.from('league_audit_log').insert({
        league_id, actor_id: null, action: 'advance_week',
        payload: { week, season, games_simmed: result.gamesSimmed, commits: result.commits },
      });

      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      await supabase.from('week_processing_log').update({
        status: 'failed', error_msg: String(err), completed_at: new Date().toISOString(),
      }).eq('league_id', league_id).eq('season', season).eq('week', week);
      throw err;
    }

  } catch (err) {
    console.error('process-week error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});

async function runWeekSimulation(supabase: any, league_id: string, league: any, week: number, season: number) {
  const newsItems: any[] = [];
  let gamesSimmed = 0;
  let commits = 0;
  let portalMoves = 0;

  // ── Load teams ──
  const { data: teams } = await supabase.from('league_teams')
    .select('id, school_id, team_overall, prestige, program_momentum, coach_prestige, nil_bank, facilities_level, schools(name, short_name, arena_capacity)')
    .eq('league_id', league_id);

  const teamMap = new Map((teams || []).map((t: any) => [t.id, t]));

  // ── Load players ──
  const { data: allPlayers } = await supabase.from('players').select('*').eq('league_id', league_id);
  const playersByTeam = new Map<string, any[]>();
  for (const p of (allPlayers || [])) {
    if (!playersByTeam.has(p.team_id)) playersByTeam.set(p.team_id, []);
    playersByTeam.get(p.team_id)!.push(p);
  }

  // ── Load this week's games ──
  const { data: games } = await supabase.from('schedule_games')
    .select('*').eq('league_id', league_id).eq('season', season).eq('week', week).eq('is_played', false);

  // ── Simulate games ──
  for (const game of (games || [])) {
    const homePlayers = playersByTeam.get(game.home_team_id) || [];
    const awayPlayers = playersByTeam.get(game.away_team_id) || [];
    const homeTeam = teamMap.get(game.home_team_id) as any;
    const awayTeam = teamMap.get(game.away_team_id) as any;
    if (!homeTeam || !awayTeam) continue;

    const homeRatings = calcRatings(homePlayers);
    const awayRatings = calcRatings(awayPlayers);

    const simSeed = hashCode(`${league_id}-${game.id}-${week}`);
    const result = simulateGame(homeRatings, awayRatings, homeTeam, awayTeam, game, simSeed);

    await supabase.from('game_results').insert({
      league_id, game_id: game.id, season, week,
      home_team_id: game.home_team_id, away_team_id: game.away_team_id,
      home_score: result.homeScore, away_score: result.awayScore,
      winner_team_id: result.winnerId,
      home_stats_json: result.homeStats, away_stats_json: result.awayStats,
      key_plays_json: result.keyPlays, sim_seed: simSeed, overtime_periods: result.ot,
    });
    await supabase.from('schedule_games').update({ is_played: true }).eq('id', game.id);

    await upsertStats(supabase, league_id, season, game.home_team_id, result.homeScore, result.awayScore, result.winnerId === game.home_team_id, game.game_type);
    await upsertStats(supabase, league_id, season, game.away_team_id, result.awayScore, result.homeScore, result.winnerId === game.away_team_id, game.game_type);

    gamesSimmed++;

    const winner = teamMap.get(result.winnerId) as any;
    const loser = teamMap.get(result.winnerId === game.home_team_id ? game.away_team_id : game.home_team_id) as any;
    const upset = Math.abs(homeRatings.overall - awayRatings.overall) > 10 && result.winnerId !== game.home_team_id;
    newsItems.push({
      league_id, season, week, type: 'game_result',
      importance: upset ? 4 : Math.abs(result.homeScore - result.awayScore) > 25 ? 3 : 2,
      headline: `${winner?.schools?.short_name} ${upset ? 'UPSETS' : 'defeats'} ${loser?.schools?.short_name} ${result.homeScore}-${result.awayScore}`,
      team_id: result.winnerId,
      metadata: { home_score: result.homeScore, away_score: result.awayScore },
    });
  }

  // ── Process recruiting ──
  commits = await processRecruiting(supabase, league_id, season, week, newsItems);

  // ── Process portal ──
  portalMoves = await processPortal(supabase, league_id, season, week, newsItems);

  // ── Update NIL banks ──
  const { data: fins } = await supabase.from('team_finances').select('*').eq('league_id', league_id);
  for (const f of (fins || [])) {
    const bank = Math.max(0, f.nil_bank + f.nil_weekly_income - f.nil_committed_weekly);
    await supabase.from('team_finances').update({ nil_bank: bank }).eq('id', f.id);
    await supabase.from('league_teams').update({ nil_bank: bank }).eq('id', f.team_id);
  }

  // ── Write news ──
  if (newsItems.length > 0) {
    await supabase.from('news_feed_items').insert(newsItems);
  }

  // ── Advance week ──
  const nextWeek = week + 1;
  const nextPhase = nextWeek <= 18 ? 'regular_season' : nextWeek <= 20 ? 'conf_tournament' : nextWeek <= 23 ? 'nat_tournament' : 'offseason';
  await supabase.from('leagues').update({ current_week: nextWeek, phase: nextPhase, last_advance_at: new Date().toISOString() }).eq('id', league_id);

  return { week, nextWeek, gamesSimmed, commits, portalMoves, newsCount: newsItems.length };
}

function calcRatings(players: any[]) {
  if (!players.length) return { overall: 65, offense: 65, defense: 65, pace: 68 };
  const s = players.filter(p => p.is_starter && !p.is_injured).slice(0, 5);
  const b = players.filter(p => !p.is_starter && !p.is_injured).slice(0, 8);
  const avg = (fn: (p: any) => number, arr: any[]) => arr.length ? arr.reduce((x, p) => x + fn(p), 0) / arr.length : 65;
  const wa = (fn: (p: any) => number) => avg(fn, s) * 0.7 + avg(fn, b) * 0.3;
  return {
    overall: Math.round(wa(p => p.overall)),
    offense: Math.round(wa(p => p.attr_shooting_2pt) * 0.3 + wa(p => p.attr_shooting_3pt) * 0.25 + wa(p => p.attr_iq) * 0.25 + wa(p => p.attr_athleticism) * 0.2),
    defense: Math.round(wa(p => p.attr_defense) * 0.5 + wa(p => p.attr_rebounding) * 0.3 + wa(p => p.attr_athleticism) * 0.2),
    pace: 62 + Math.round(avg(p => p.attr_iq, players.filter(p => p.position === 'PG')) / 10),
    starters: s,
  };
}

function simulateGame(hr: any, ar: any, homeTeam: any, awayTeam: any, game: any, seed: number) {
  const rand = seededRand(seed);
  const HA = game.neutral_site ? 0 : 3.5 * Math.min(1.5, Math.max(0.5, (homeTeam.schools?.arena_capacity || 10000) / 15000));
  const calcOrtg = (off: number, def: number) => Math.max(80, Math.min(130, 95 + (off - 70) * 0.6 - (def - 70) * 0.3 + (rand() - 0.5) * 8));
  const pace = Math.round(((hr.pace + ar.pace) / 2 + (rand() - 0.5) * 4) * 2);
  let hs = Math.max(50, Math.round(calcOrtg(hr.offense + HA/2, ar.defense) / 100 * pace + (rand()-0.5)*6));
  let as2 = Math.max(50, Math.round(calcOrtg(ar.offense, hr.defense + HA/2) / 100 * pace + (rand()-0.5)*6));
  let ot = 0;
  while (hs === as2) { ot++; hs += Math.round(3+rand()*8); as2 += Math.round(3+rand()*9); if (ot>=4){if(hs===as2)hs++;break;} }
  const winnerId = hs > as2 ? game.home_team_id : game.away_team_id;
  const topHS = hr.starters?.[0]?.first_name + ' ' + hr.starters?.[0]?.last_name || 'Player';
  const topAS = ar.starters?.[0]?.first_name + ' ' + ar.starters?.[0]?.last_name || 'Player';
  const keyPlays = [
    { period:1,time_remaining:'12:00',type:'score',team_id:game.home_team_id,player_name:topHS,description:`${topHS} hits opening bucket`,score_home:2,score_away:0 },
    { period:2,time_remaining:'5:00',type:'momentum',team_id:hs>as2?game.home_team_id:game.away_team_id,player_name:'',description:`${hs>as2?homeTeam.schools?.short_name:awayTeam.schools?.short_name} goes on a 8-2 run`,score_home:Math.round(hs*0.7),score_away:Math.round(as2*0.7) },
    { period:2,time_remaining:'0:00',type:'milestone',team_id:winnerId,player_name:'',description:`Final: ${homeTeam.schools?.short_name} ${hs}, ${awayTeam.schools?.short_name} ${as2}`,score_home:hs,score_away:as2 },
  ];
  const homeStats = { points:hs, top_scorer:topHS, top_scorer_pts:Math.round(hs*0.25) };
  const awayStats = { points:as2, top_scorer:topAS, top_scorer_pts:Math.round(as2*0.25) };
  return { homeScore:hs, awayScore:as2, winnerId, ot, homeStats, awayStats, keyPlays };
}

async function upsertStats(supabase: any, league_id: string, season: number, team_id: string, scored: number, allowed: number, won: boolean, game_type: string) {
  const isConf = game_type === 'conference';
  const { data: ex } = await supabase.from('team_season_stats').select('*').eq('league_id', league_id).eq('team_id', team_id).eq('season', season).single();
  const base = ex || { wins:0,losses:0,conf_wins:0,conf_losses:0,points_scored:0,points_allowed:0,total_games:0,streak_type:'W',streak_count:0 };
  const streak = won ? (base.streak_type==='W'?{type:'W',count:base.streak_count+1}:{type:'W',count:1}) : (base.streak_type==='L'?{type:'L',count:base.streak_count+1}:{type:'L',count:1});
  await supabase.from('team_season_stats').upsert({
    league_id,team_id,season,
    wins:base.wins+(won?1:0),losses:base.losses+(won?0:1),
    conf_wins:base.conf_wins+(isConf&&won?1:0),conf_losses:base.conf_losses+(isConf&&!won?1:0),
    points_scored:base.points_scored+scored,points_allowed:base.points_allowed+allowed,
    total_games:base.total_games+1,streak_type:streak.type,streak_count:streak.count,
    updated_at:new Date().toISOString(),
  },{onConflict:'league_id,team_id,season'});
  await supabase.from('league_teams').update({wins:base.wins+(won?1:0),losses:base.losses+(won?0:1)}).eq('id',team_id);
}

async function processRecruiting(supabase: any, league_id: string, season: number, week: number, newsItems: any[]) {
  const { data: recruits } = await supabase.from('league_recruits').select('*').eq('league_id', league_id).in('status', ['available','considering']);
  if (!recruits?.length) return 0;
  const { data: actions } = await supabase.from('recruiting_actions').select('*').eq('league_id', league_id).eq('week', week);
  const { data: teams } = await supabase.from('league_teams').select('id,prestige,coach_prestige,facilities_level,schools(short_name)').eq('league_id', league_id);
  const teamMap = new Map((teams||[]).map((t:any)=>[t.id,t]));

  // Build offers per recruit
  const offerMap = new Map<string, any[]>();
  for (const a of (actions||[])) {
    if (!a.scholarship_offered) continue;
    if (!offerMap.has(a.recruit_id)) offerMap.set(a.recruit_id, []);
    const t = teamMap.get(a.team_id) as any;
    offerMap.get(a.recruit_id)!.push({ team_id: a.team_id, points: a.points_spent, prestige: t?.prestige||3 });
  }

  let commits = 0;
  const SIGNING_WEEK = 14;
  const rand = seededRand(hashCode(`${league_id}-rec-${week}`));

  for (const rec of recruits) {
    const offers = offerMap.get(rec.id) || [];
    if (!offers.length) continue;
    const best = offers.sort((a:any,b:any)=>b.points-a.points)[0];
    const threshold = 60 + (rec.stars-1)*8;
    const newScore = Math.min(100, rec.commit_score + (best.points/100)*20 + (rand()-0.5)*10);

    if (newScore >= threshold || week >= SIGNING_WEEK) {
      await supabase.from('league_recruits').update({ status:'committed', committed_to_team_id:best.team_id, commit_week:week, commit_score:100 }).eq('id', rec.id);
      const t = teamMap.get(best.team_id) as any;
      newsItems.push({ league_id, season, week, type:'recruit_commit', importance: rec.stars>=4?4:rec.stars>=3?3:2,
        headline:`${'★'.repeat(rec.stars)} ${rec.first_name} ${rec.last_name} (${rec.position}) commits to ${t?.schools?.short_name||'Unknown'}`,
        recruit_id:rec.id, team_id:best.team_id });
      commits++;
    } else {
      await supabase.from('league_recruits').update({ status:'considering', commit_score: Math.round(newScore) }).eq('id', rec.id);
    }
  }
  return commits;
}

async function processPortal(supabase: any, league_id: string, season: number, week: number, newsItems: any[]) {
  const { data: entries } = await supabase.from('portal_entries').select('*, players(first_name,last_name,position,overall)').eq('league_id', league_id).eq('status', 'open');
  if (!entries?.length) return 0;
  let moves = 0;
  for (const entry of entries) {
    if (week - entry.entered_week < 3) continue;
    const { data: offers } = await supabase.from('portal_offers').select('*,league_teams(prestige,schools(short_name))').eq('portal_entry_id', entry.id).eq('status', 'pending');
    if (!offers?.length) continue;
    const best = offers.sort((a:any,b:any)=>(b.nil_offer+b.league_teams.prestige*10000)-(a.nil_offer+a.league_teams.prestige*10000))[0];
    if (Math.random() < 0.7) {
      await supabase.from('portal_entries').update({ status:'committed', committed_to_team_id:best.team_id, commit_week:week }).eq('id', entry.id);
      await supabase.from('players').update({ team_id:best.team_id, in_portal:false, morale:75 }).eq('id', entry.player_id);
      const p = entry.players as any;
      newsItems.push({ league_id, season, week, type:'portal_move', importance: p?.overall>=80?4:2,
        headline:`${p?.first_name} ${p?.last_name} (${p?.position}) transfers to ${best.league_teams?.schools?.short_name}`,
        player_id:entry.player_id, team_id:best.team_id });
      moves++;
    }
  }
  return moves;
}

function seededRand(seed: number) {
  let s = seed;
  return () => { s += 0x6D2B79F5; let z = s; z = Math.imul(z^(z>>>15),z|1); z ^= z+Math.imul(z^(z>>>7),z|61); return ((z^(z>>>14))>>>0)/4294967296; };
}
function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h<<5)-h)+str.charCodeAt(i); h = h&h; }
  return Math.abs(h);
}
