// ============================================================
// Week Processing Engine (called by Edge Function)
// This runs inside a Supabase Edge Function with service role
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { simulateGame, calculateTeamRatings, type TeamSimInput, type SimPlayer } from './simulation';
import { processRecruitingWeek, type RecruitState, type TeamRecruitingOffer } from './recruiting';

export interface WeekProcessingResult {
  league_id: string;
  week: number;
  games_simmed: number;
  commits: number;
  portal_moves: number;
  news_items: number;
  errors: string[];
}

export async function processWeek(
  supabase: SupabaseClient,
  league_id: string
): Promise<WeekProcessingResult> {
  const errors: string[] = [];

  // ── 1. Load league state ──
  const { data: league, error: leagueErr } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', league_id)
    .single();

  if (leagueErr || !league) throw new Error('League not found');

  const week = league.current_week;
  const season = league.season;

  // ── 2. Idempotency check + lock ──
  const { data: existing } = await supabase
    .from('week_processing_log')
    .select('id, status')
    .eq('league_id', league_id)
    .eq('season', season)
    .eq('week', week)
    .single();

  if (existing?.status === 'completed') {
    return { league_id, week, games_simmed: 0, commits: 0, portal_moves: 0, news_items: 0, errors: ['Already processed'] };
  }

  // Insert processing lock
  const { error: lockErr } = await supabase
    .from('week_processing_log')
    .insert({ league_id, season, week, status: 'processing' });

  if (lockErr) {
    return { league_id, week, games_simmed: 0, commits: 0, portal_moves: 0, news_items: 0, errors: ['Lock failed — concurrent processing'] };
  }

  try {
    // ── 3. Load teams with players ──
    const { data: teams } = await supabase
      .from('league_teams')
      .select(`
        id, school_id, team_overall, prestige, program_momentum,
        coach_prestige, coach_offense_style, coach_defense_style,
        nil_bank, nil_weekly_income, facilities_level,
        schools (name, short_name, arena_capacity)
      `)
      .eq('league_id', league_id);

    if (!teams) throw new Error('No teams found');

    // Build team map
    const teamMap = new Map(teams.map(t => [t.id, t]));

    // ── 4. Load players per team ──
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('league_id', league_id);

    const playersByTeam = new Map<string, typeof allPlayers>();
    for (const p of (allPlayers || [])) {
      if (!playersByTeam.has(p.team_id)) playersByTeam.set(p.team_id, []);
      playersByTeam.get(p.team_id)!.push(p);
    }

    // ── 5. Load games for this week ──
    const { data: games } = await supabase
      .from('schedule_games')
      .select('*')
      .eq('league_id', league_id)
      .eq('season', season)
      .eq('week', week)
      .eq('is_played', false);

    // ── 6. Simulate each game ──
    let gamesSimmed = 0;
    const newsItems: Array<{
      league_id: string; season: number; week: number;
      type: string; importance: number; headline: string;
      body?: string; team_id?: string; metadata?: object;
    }> = [];

    for (const game of (games || [])) {
      const homePlayers = playersByTeam.get(game.home_team_id) || [];
      const awayPlayers = playersByTeam.get(game.away_team_id) || [];
      const homeTeam = teamMap.get(game.home_team_id);
      const awayTeam = teamMap.get(game.away_team_id);

      if (!homeTeam || !awayTeam) continue;

      // Build sim players
      const toSimPlayer = (p: any): SimPlayer => ({
        player_id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        position: p.position,
        overall: p.overall,
        is_starter: p.is_starter,
        is_injured: p.is_injured,
        attr_shooting_2pt: p.attr_shooting_2pt,
        attr_shooting_3pt: p.attr_shooting_3pt,
        attr_defense: p.attr_defense,
        attr_rebounding: p.attr_rebounding,
        attr_iq: p.attr_iq,
        attr_athleticism: p.attr_athleticism,
        morale: p.morale,
      });

      const homeSimPlayers = homePlayers.map(toSimPlayer);
      const awaySimPlayers = awayPlayers.map(toSimPlayer);

      const homeRatings = calculateTeamRatings(homeSimPlayers);
      const awayRatings = calculateTeamRatings(awaySimPlayers);

      const homeInput: TeamSimInput = {
        team_id: game.home_team_id,
        school_name: (homeTeam.schools as any)?.short_name || 'Home',
        overall: homeRatings.overall,
        offense_rating: homeRatings.offense_rating,
        defense_rating: homeRatings.defense_rating,
        pace: homeRatings.pace,
        coach_prestige: homeTeam.coach_prestige,
        morale: homeTeam.program_momentum,
        is_home: !game.neutral_site,
        home_court_factor: Math.min(1.5, Math.max(0.5, ((homeTeam.schools as any)?.arena_capacity || 10000) / 15000)),
        key_players: homeSimPlayers,
      };

      const awayInput: TeamSimInput = {
        team_id: game.away_team_id,
        school_name: (awayTeam.schools as any)?.short_name || 'Away',
        overall: awayRatings.overall,
        offense_rating: awayRatings.offense_rating,
        defense_rating: awayRatings.defense_rating,
        pace: awayRatings.pace,
        coach_prestige: awayTeam.coach_prestige,
        morale: awayTeam.program_momentum,
        is_home: false,
        home_court_factor: 1,
        key_players: awaySimPlayers,
      };

      // Seed: hash of league+game+week for determinism
      const simSeed = hashCode(`${league_id}-${game.id}-${week}`);
      const result = simulateGame(homeInput, awayInput, simSeed);

      // Write game result
      await supabase.from('game_results').insert({
        league_id,
        game_id: game.id,
        season,
        week,
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id,
        home_score: result.home_score,
        away_score: result.away_score,
        winner_team_id: result.winner_team_id,
        home_stats_json: result.home_stats,
        away_stats_json: result.away_stats,
        key_plays_json: result.key_plays,
        sim_seed: simSeed,
        overtime_periods: result.overtime_periods,
      });

      // Mark game as played
      await supabase.from('schedule_games')
        .update({ is_played: true })
        .eq('id', game.id);

      // Update team season stats
      await updateTeamStats(supabase, league_id, season, game.home_team_id, result.home_score, result.away_score, result.winner_team_id === game.home_team_id, game.game_type);
      await updateTeamStats(supabase, league_id, season, game.away_team_id, result.away_score, result.home_score, result.winner_team_id === game.away_team_id, game.game_type);

      gamesSimmed++;

      // Generate news
      const isUpset = homeRatings.overall - awayRatings.overall > 10 && result.winner_team_id === game.away_team_id;
      const isBlowout = Math.abs(result.home_score - result.away_score) > 25;
      const winnerTeam = teamMap.get(result.winner_team_id)!;
      const loserTeamId = result.winner_team_id === game.home_team_id ? game.away_team_id : game.home_team_id;
      const loserTeam = teamMap.get(loserTeamId)!;

      newsItems.push({
        league_id,
        season,
        week,
        type: 'game_result',
        importance: isUpset ? 4 : isBlowout ? 3 : 2,
        headline: `${(winnerTeam.schools as any)?.short_name} ${isUpset ? 'UPSETS' : 'defeats'} ${(loserTeam.schools as any)?.short_name}, ${result.home_score}-${result.away_score}`,
        body: result.key_plays[result.key_plays.length - 1]?.description,
        team_id: result.winner_team_id,
        metadata: { home_score: result.home_score, away_score: result.away_score, game_id: game.id },
      });
    }

    // ── 7. Process recruiting ──
    let commits = 0;
    try {
      commits = await processRecruitingForWeek(supabase, league_id, season, week, newsItems);
    } catch (e) {
      errors.push(`Recruiting error: ${e}`);
    }

    // ── 8. Apply AD decisions ──
    try {
      await applyAdDecisions(supabase, league_id, season, week);
    } catch (e) {
      errors.push(`AD decisions error: ${e}`);
    }

    // ── 9. Update NIL banks ──
    try {
      await updateNilBanks(supabase, league_id);
    } catch (e) {
      errors.push(`NIL update error: ${e}`);
    }

    // ── 10. Portal processing (simplified) ──
    let portalMoves = 0;
    try {
      portalMoves = await processPortalWeek(supabase, league_id, season, week, newsItems);
    } catch (e) {
      errors.push(`Portal error: ${e}`);
    }

    // ── 11. Write all news items ──
    if (newsItems.length > 0) {
      await supabase.from('news_feed_items').insert(newsItems);
    }

    // ── 12. Advance week ──
    const nextWeek = week + 1;
    const nextPhase = determineNextPhase(league, nextWeek);

    await supabase.from('leagues').update({
      current_week: nextWeek,
      phase: nextPhase,
      last_advance_at: new Date().toISOString(),
    }).eq('id', league_id);

    // ── 13. Mark processing complete ──
    await supabase.from('week_processing_log').update({
      status: 'completed',
      games_simmed: gamesSimmed,
      completed_at: new Date().toISOString(),
    }).eq('league_id', league_id).eq('season', season).eq('week', week);

    return { league_id, week, games_simmed: gamesSimmed, commits, portal_moves: portalMoves, news_items: newsItems.length, errors };

  } catch (err) {
    await supabase.from('week_processing_log').update({
      status: 'failed',
      error_msg: String(err),
      completed_at: new Date().toISOString(),
    }).eq('league_id', league_id).eq('season', season).eq('week', week);
    throw err;
  }
}

async function updateTeamStats(
  supabase: SupabaseClient,
  league_id: string,
  season: number,
  team_id: string,
  scored: number,
  allowed: number,
  won: boolean,
  game_type: string
) {
  const isConf = game_type === 'conference';

  const { data: existing } = await supabase
    .from('team_season_stats')
    .select('*')
    .eq('league_id', league_id)
    .eq('team_id', team_id)
    .eq('season', season)
    .single();

  const base = existing || {
    wins: 0, losses: 0, conf_wins: 0, conf_losses: 0,
    points_scored: 0, points_allowed: 0, total_games: 0,
    streak_type: 'W', streak_count: 0
  };

  const newStreak = won
    ? base.streak_type === 'W' ? { type: 'W', count: base.streak_count + 1 } : { type: 'W', count: 1 }
    : base.streak_type === 'L' ? { type: 'L', count: base.streak_count + 1 } : { type: 'L', count: 1 };

  const updates = {
    league_id, team_id, season,
    wins: base.wins + (won ? 1 : 0),
    losses: base.losses + (won ? 0 : 1),
    conf_wins: base.conf_wins + (isConf && won ? 1 : 0),
    conf_losses: base.conf_losses + (isConf && !won ? 1 : 0),
    points_scored: base.points_scored + scored,
    points_allowed: base.points_allowed + allowed,
    total_games: base.total_games + 1,
    streak_type: newStreak.type,
    streak_count: newStreak.count,
    updated_at: new Date().toISOString(),
  };

  await supabase.from('team_season_stats').upsert(updates, { onConflict: 'league_id,team_id,season' });

  // Also update league_teams denormalized record
  await supabase.from('league_teams').update({
    wins: updates.wins,
    losses: updates.losses,
    conf_wins: updates.conf_wins,
    conf_losses: updates.conf_losses,
  }).eq('id', team_id);
}

async function processRecruitingForWeek(
  supabase: SupabaseClient,
  league_id: string,
  season: number,
  week: number,
  newsItems: any[]
): Promise<number> {
  const { data: recruits } = await supabase
    .from('league_recruits')
    .select('*')
    .eq('league_id', league_id)
    .in('status', ['available', 'considering']);

  if (!recruits || recruits.length === 0) return 0;

  const { data: actions } = await supabase
    .from('recruiting_actions')
    .select('*')
    .eq('league_id', league_id)
    .eq('week', week)
    .eq('action_type', 'allocate_points');

  const { data: teams } = await supabase
    .from('league_teams')
    .select('id, prestige, coach_prestige, facilities_level')
    .eq('league_id', league_id);

  const { data: recStates } = await supabase
    .from('team_recruiting_state')
    .select('*')
    .eq('league_id', league_id)
    .eq('season', season);

  const teamMap = new Map((teams || []).map(t => [t.id, t]));
  const stateMap = new Map((recStates || []).map(s => [s.team_id, s]));

  // Build offers map
  const offersMap = new Map<string, TeamRecruitingOffer[]>();
  for (const action of (actions || [])) {
    const team = teamMap.get(action.team_id);
    const state = stateMap.get(action.team_id);
    if (!team) continue;
    const scholRemaining = (state?.scholarships_total || 13) - (state?.scholarships_used || 0);

    if (!offersMap.has(action.recruit_id)) offersMap.set(action.recruit_id, []);
    offersMap.get(action.recruit_id)!.push({
      team_id: action.team_id,
      points_allocated: action.points_spent,
      scholarship_offered: action.scholarship_offered,
      nil_offered: 0, // TODO: pull from nil actions
      team_prestige: team.prestige,
      coach_prestige: team.coach_prestige,
      facilities_level: team.facilities_level,
      scholarships_remaining: scholRemaining,
    });
  }

  const recruitStates: RecruitState[] = recruits.map(r => ({
    recruit_id: r.id,
    stars: r.stars,
    overall: r.overall,
    pref_proximity: r.pref_proximity,
    pref_prestige: r.pref_prestige,
    pref_nil: r.pref_nil,
    pref_playing_time: r.pref_playing_time,
    pref_coach_stability: r.pref_coach_stability,
    home_state: r.home_state,
    commit_score: r.commit_score,
    status: r.status,
    committed_to_team_id: r.committed_to_team_id,
  }));

  const SIGNING_WEEK = 14; // week 14 = signing day
  const seed = hashCode(`${league_id}-recruiting-${week}`);
  const results = processRecruitingWeek(recruitStates, offersMap, week, SIGNING_WEEK, seed);

  let commits = 0;

  for (const result of results) {
    if (result.outcome === 'commit' && result.committed_to_team_id) {
      await supabase.from('league_recruits').update({
        status: 'committed',
        committed_to_team_id: result.committed_to_team_id,
        commit_week: week,
        commit_score: 100,
      }).eq('id', result.recruit_id);

      // Update team's scholarship count
      const { data: rec } = await supabase.from('league_recruits').select('stars, first_name, last_name, position').eq('id', result.recruit_id).single();
      const { data: team } = await supabase.from('league_teams').select('schools(short_name)').eq('id', result.committed_to_team_id).single();

      if (rec) {
        newsItems.push({
          league_id, season, week,
          type: 'recruit_commit',
          importance: rec.stars >= 4 ? 4 : rec.stars >= 3 ? 3 : 2,
          headline: `${'★'.repeat(rec.stars)} ${rec.first_name} ${rec.last_name} (${rec.position}) commits to ${(team?.schools as any)?.short_name || 'Unknown'}`,
          recruit_id: result.recruit_id,
          team_id: result.committed_to_team_id,
        });
      }

      commits++;

    } else if (result.outcome === 'still_considering') {
      await supabase.from('league_recruits').update({
        status: 'considering',
        commit_score: Math.min(99, recruits.find(r => r.id === result.recruit_id)?.commit_score + result.commit_score_delta),
      }).eq('id', result.recruit_id);

    } else if (result.outcome === 'passed') {
      await supabase.from('league_recruits').update({ status: 'passed' }).eq('id', result.recruit_id);
    }
  }

  return commits;
}

async function processPortalWeek(
  supabase: SupabaseClient,
  league_id: string,
  season: number,
  week: number,
  newsItems: any[]
): Promise<number> {
  const { data: openEntries } = await supabase
    .from('portal_entries')
    .select('*, players(first_name, last_name, position, overall, team_id)')
    .eq('league_id', league_id)
    .eq('status', 'open');

  if (!openEntries || openEntries.length === 0) return 0;

  let moves = 0;
  const PORTAL_DECISION_WEEK = 3; // takes 3 weeks in portal min

  for (const entry of openEntries) {
    const weeksInPortal = week - entry.entered_week;
    if (weeksInPortal < PORTAL_DECISION_WEEK) continue;

    // Find offers for this entry
    const { data: offers } = await supabase
      .from('portal_offers')
      .select('*, league_teams(prestige, coach_prestige, facilities_level)')
      .eq('portal_entry_id', entry.id)
      .eq('status', 'pending');

    if (!offers || offers.length === 0) continue;

    // Pick best offer
    const best = offers.sort((a, b) => {
      const aTeam = a.league_teams as any;
      const bTeam = b.league_teams as any;
      return (b.nil_offer + bTeam.prestige * 10000) - (a.nil_offer + aTeam.prestige * 10000);
    })[0];

    // 70% chance of committing to best offer after min weeks
    const rand = Math.random();
    if (rand < 0.7) {
      await supabase.from('portal_entries').update({
        status: 'committed',
        committed_to_team_id: best.team_id,
        commit_week: week,
      }).eq('id', entry.id);

      // Move player to new team
      await supabase.from('players').update({
        team_id: best.team_id,
        in_portal: false,
        morale: 75,
      }).eq('id', entry.player_id);

      const player = entry.players as any;
      const { data: newTeam } = await supabase.from('league_teams').select('schools(short_name)').eq('id', best.team_id).single();

      newsItems.push({
        league_id, season, week,
        type: 'portal_move',
        importance: player?.overall >= 80 ? 4 : 2,
        headline: `${player?.first_name} ${player?.last_name} (${player?.position}) transfers to ${(newTeam?.schools as any)?.short_name}`,
        player_id: entry.player_id,
        team_id: best.team_id,
      });

      moves++;
    }
  }

  return moves;
}

async function applyAdDecisions(
  supabase: SupabaseClient,
  league_id: string,
  season: number,
  week: number
) {
  const { data: decisions } = await supabase
    .from('ad_decisions')
    .select('*')
    .eq('league_id', league_id)
    .eq('season', season)
    .eq('week', week);

  for (const d of (decisions || [])) {
    const effect = d.effect_json as any;
    if (!effect) continue;

    const updates: any = {};
    if (effect.facilities_delta) updates.facilities_level = supabase.rpc as any; // handled below
    if (effect.nil_delta) {
      await supabase.from('team_finances').update({
        nil_bank: supabase.rpc as any // use raw SQL in prod
      }).eq('team_id', d.team_id);
    }
    if (effect.momentum_delta) {
      const { data: team } = await supabase.from('league_teams').select('program_momentum').eq('id', d.team_id).single();
      if (team) {
        await supabase.from('league_teams').update({
          program_momentum: Math.min(100, Math.max(0, team.program_momentum + effect.momentum_delta))
        }).eq('id', d.team_id);
      }
    }
  }
}

async function updateNilBanks(supabase: SupabaseClient, league_id: string) {
  // Add weekly income to nil_bank for all teams
  const { data: finances } = await supabase
    .from('team_finances')
    .select('*')
    .eq('league_id', league_id);

  for (const f of (finances || [])) {
    const newBank = Math.max(0, f.nil_bank + f.nil_weekly_income - f.nil_committed_weekly);
    await supabase.from('team_finances').update({ nil_bank: newBank }).eq('id', f.id);
    await supabase.from('league_teams').update({ nil_bank: newBank }).eq('id', f.team_id);
  }
}

function determineNextPhase(league: any, nextWeek: number): string {
  if (nextWeek === 0) return 'setup';
  if (nextWeek <= 18) return 'regular_season';
  if (nextWeek <= 20) return 'conf_tournament';
  if (nextWeek <= 23) return 'nat_tournament';
  return 'offseason';
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
