// ============================================================
// Basketball Match Simulation Engine
// Server-side only. Deterministic given the same seed.
// ============================================================

export interface TeamSimInput {
  team_id: string;
  school_name: string;
  overall: number;          // team overall rating 40-99
  offense_rating: number;   // 40-99
  defense_rating: number;   // 40-99
  pace: number;             // possessions per 40 min (60-80)
  coach_prestige: number;   // 1-5
  morale: number;           // 0-100
  is_home: boolean;
  home_court_factor: number; // arena capacity / 20000, clamped 0.5-1.5
  key_players: SimPlayer[];
}

export interface SimPlayer {
  player_id: string;
  name: string;
  position: string;
  overall: number;
  is_starter: boolean;
  is_injured: boolean;
  attr_shooting_2pt: number;
  attr_shooting_3pt: number;
  attr_defense: number;
  attr_rebounding: number;
  attr_iq: number;
  attr_athleticism: number;
  morale: number;
}

export interface GameSimResult {
  home_score: number;
  away_score: number;
  winner_team_id: string;
  overtime_periods: number;
  home_stats: TeamGameStats;
  away_stats: TeamGameStats;
  key_plays: PlayEvent[];
  sim_seed: number;
}

export interface TeamGameStats {
  points: number;
  fg_made: number;
  fg_attempted: number;
  fg_pct: number;
  three_made: number;
  three_attempted: number;
  three_pct: number;
  ft_made: number;
  ft_attempted: number;
  ft_pct: number;
  rebounds: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  possessions: number;
  off_rating: number;
  def_rating: number;
  top_scorer: string;
  top_scorer_pts: number;
  top_rebounder: string;
  top_rebounder_reb: number;
}

export interface PlayEvent {
  period: number;
  time_remaining: string;
  type: 'score' | 'turnover' | 'momentum' | 'milestone';
  team_id: string;
  player_name: string;
  description: string;
  score_home: number;
  score_away: number;
}

// Seeded PRNG (Mulberry32)
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6D2B79F5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateGame(
  home: TeamSimInput,
  away: TeamSimInput,
  seed: number
): GameSimResult {
  const rand = seededRand(seed);

  // ── Effective ratings ──
  const HOME_ADVANTAGE = home.is_home ? 3.5 * (home.home_court_factor || 1) : 0;
  const moraleFactor = (t: TeamSimInput) => (t.morale - 50) / 200; // -0.25 to +0.25

  const homeOff = home.offense_rating + HOME_ADVANTAGE / 2 + moraleFactor(home) * 10;
  const homeDef = home.defense_rating + HOME_ADVANTAGE / 2 + moraleFactor(home) * 8;
  const awayOff = away.offense_rating + moraleFactor(away) * 10;
  const awayDef = away.defense_rating + moraleFactor(away) * 8;

  // ── Pace: average of both teams + randomness ──
  const avgPace = (home.pace + away.pace) / 2 + (rand() - 0.5) * 4;
  const totalPoss = Math.round(avgPace); // per half, *2 total

  // ── Offensive ratings per 100 possessions ──
  // Based on overall + scheme + matchup
  function calcOrtg(offRating: number, oppDefRating: number): number {
    // League avg ~103, scale around that
    const base = 95 + (offRating - 70) * 0.6 - (oppDefRating - 70) * 0.3;
    return Math.max(80, Math.min(130, base + (rand() - 0.5) * 8));
  }

  const homeOrtg = calcOrtg(homeOff, awayDef);
  const awayOrtg = calcOrtg(awayOff, homeDef);

  // ── Score calculation ──
  const homePoss = totalPoss * 2;
  const awayPoss = totalPoss * 2;

  let homeScore = Math.round((homeOrtg / 100) * homePoss + (rand() - 0.5) * 6);
  let awayScore = Math.round((awayOrtg / 100) * awayPoss + (rand() - 0.5) * 6);

  homeScore = Math.max(50, homeScore);
  awayScore = Math.max(50, awayScore);

  // ── Overtime ──
  let overtimePeriods = 0;
  while (homeScore === awayScore) {
    overtimePeriods++;
    const otExtra = Math.round(5 + rand() * 8);
    homeScore += otExtra;
    awayScore += Math.round(4 + rand() * 9);
    if (overtimePeriods >= 4) {
      // Force a winner after 4OT
      if (homeScore === awayScore) homeScore++;
      break;
    }
  }

  const winnerId = homeScore > awayScore ? home.team_id : away.team_id;

  // ── Stats generation ──
  function genStats(score: number, poss: number, offRtg: number, teamData: TeamSimInput): TeamGameStats {
    const r = () => rand();
    const fgPct = 0.40 + (offRtg - 95) / 300 + (r() - 0.5) * 0.06;
    const threePct = 0.32 + (offRtg - 95) / 500 + (r() - 0.5) * 0.05;
    const ftPct = 0.65 + (r() - 0.5) * 0.10;

    const ftAttempted = Math.round(poss * 0.25 + r() * 5);
    const ftMade = Math.round(ftAttempted * ftPct);
    const threeAttempted = Math.round(poss * 0.35 + r() * 8);
    const threeMade = Math.round(threeAttempted * threePct);
    const fgAttempted = Math.round(poss * 0.85 + r() * 5);
    const twoAttempted = fgAttempted - threeAttempted;
    const twoMade = Math.round(fgAttempted * fgPct) - threeMade;
    const fgMade = Math.max(0, twoMade) + threeMade;
    const computedScore = fgMade * 2 + threeMade + ftMade;

    // Pick top scorer/rebounder from starters
    const starters = teamData.key_players.filter(p => p.is_starter && !p.is_injured).slice(0, 5);
    const startersByOverall = [...starters].sort((a, b) => b.overall - a.overall);
    const topScorer = startersByOverall[0] || { name: 'Unknown', overall: 70 };
    const topRebounder = [...starters].sort((a, b) => b.attr_rebounding - a.attr_rebounding)[0] || topScorer;

    const topScorePts = Math.round(score * (0.18 + r() * 0.12));
    const topRebReb = Math.round(5 + r() * 8);

    return {
      points: score,
      fg_made: fgMade,
      fg_attempted: fgAttempted,
      fg_pct: Math.round(fgPct * 1000) / 10,
      three_made: threeMade,
      three_attempted: threeAttempted,
      three_pct: Math.round(threePct * 1000) / 10,
      ft_made: ftMade,
      ft_attempted: ftAttempted,
      ft_pct: Math.round(ftPct * 1000) / 10,
      rebounds: Math.round(30 + r() * 15),
      assists: Math.round(fgMade * 0.55 + r() * 4),
      turnovers: Math.round(10 + r() * 8),
      steals: Math.round(4 + r() * 5),
      blocks: Math.round(2 + r() * 4),
      possessions: poss,
      off_rating: Math.round(offRtg * 10) / 10,
      def_rating: 0, // filled below
      top_scorer: topScorer.name,
      top_scorer_pts: topScorePts,
      top_rebounder: topRebounder.name,
      top_rebounder_reb: topRebReb,
    };
  }

  const homeStats = genStats(homeScore, homePoss, homeOrtg, home);
  const awayStats = genStats(awayScore, awayPoss, awayOrtg, away);
  homeStats.def_rating = Math.round(awayOrtg * 10) / 10;
  awayStats.def_rating = Math.round(homeOrtg * 10) / 10;

  // ── Key plays generation ──
  const keyPlays = generateKeyPlays(home, away, homeScore, awayScore, rand);

  return {
    home_score: homeScore,
    away_score: awayScore,
    winner_team_id: winnerId,
    overtime_periods: overtimePeriods,
    home_stats: homeStats,
    away_stats: awayStats,
    key_plays: keyPlays,
    sim_seed: seed,
  };
}

function generateKeyPlays(
  home: TeamSimInput,
  away: TeamSimInput,
  homeScore: number,
  awayScore: number,
  rand: () => number
): PlayEvent[] {
  const plays: PlayEvent[] = [];

  // Generate 8-12 key events across 2 halves
  const numPlays = 8 + Math.floor(rand() * 5);

  const homeStarters = home.key_players.filter(p => p.is_starter && !p.is_injured).slice(0, 5);
  const awayStarters = away.key_players.filter(p => p.is_starter && !p.is_injured).slice(0, 5);

  const homeScorer = homeStarters.sort((a, b) => b.overall - a.overall)[0];
  const awayScorer = awayStarters.sort((a, b) => b.overall - a.overall)[0];

  // Simulate score evolution
  let hScore = 0;
  let aScore = 0;
  const periods = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2];

  for (let i = 0; i < numPlays; i++) {
    const period = periods[i] || 2;
    const timeRemaining = `${Math.floor(rand() * 18)}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`;
    const isHome = rand() > 0.5;
    const team = isHome ? home : away;
    const scorer = isHome ? homeScorer : awayScorer;
    const playRoll = rand();

    let type: PlayEvent['type'] = 'score';
    let description = '';
    let playerName = scorer?.name || 'Team Player';

    if (playRoll < 0.55) {
      // Score play
      const pts = rand() > 0.35 ? 3 : 2;
      if (isHome) hScore += pts;
      else aScore += pts;
      const verb = pts === 3
        ? ['drains the three!', 'from deep!', 'triple!', 'three-pointer goes down!'][Math.floor(rand() * 4)]
        : ['scores inside', 'mid-range', 'converted the layup', 'slam dunk!', 'gets the bucket'][Math.floor(rand() * 5)];
      description = `${playerName} ${verb}`;
      type = 'score';
    } else if (playRoll < 0.70) {
      type = 'turnover';
      const verb = ['turnover', 'stolen by the defense', 'out of bounds', 'lost the handle'][Math.floor(rand() * 4)];
      description = `${playerName} — ${verb}`;
    } else if (playRoll < 0.85) {
      type = 'momentum';
      const run = Math.floor(rand() * 8) + 4;
      const tName = team.school_name;
      description = `${tName} goes on a ${run}-0 run to take control`;
      if (isHome) hScore += Math.floor(run * 0.6);
      else aScore += Math.floor(run * 0.6);
    } else {
      type = 'milestone';
      const mils = [
        `${playerName} reaches 20 points`,
        `${team.school_name} extends lead to double digits`,
        `${playerName} with the and-one!`,
        `Timeout called — ${team.school_name} regroups`,
        `${playerName} dominant on the boards`,
      ];
      description = mils[Math.floor(rand() * mils.length)];
    }

    plays.push({
      period,
      time_remaining: timeRemaining,
      type,
      team_id: team.team_id,
      player_name: playerName,
      description,
      score_home: Math.min(hScore, homeScore),
      score_away: Math.min(aScore, awayScore),
    });
  }

  // Final buzzer
  const finalTeam = homeScore > awayScore ? home : away;
  plays.push({
    period: 2,
    time_remaining: '0:00',
    type: 'milestone',
    team_id: finalTeam.team_id,
    player_name: '',
    description: `Final: ${home.school_name} ${homeScore}, ${away.school_name} ${awayScore}`,
    score_home: homeScore,
    score_away: awayScore,
  });

  return plays;
}

// ── Team rating calculator ──
export function calculateTeamRatings(players: SimPlayer[]): {
  overall: number;
  offense_rating: number;
  defense_rating: number;
  pace: number;
} {
  if (players.length === 0) {
    return { overall: 65, offense_rating: 65, defense_rating: 65, pace: 68 };
  }

  const starters = players.filter(p => p.is_starter && !p.is_injured).slice(0, 5);
  const bench = players.filter(p => !p.is_starter && !p.is_injured).slice(0, 8);

  const starterWeight = 0.7;
  const benchWeight = 0.3;

  const avgStarter = (fn: (p: SimPlayer) => number) =>
    starters.length > 0
      ? starters.reduce((s, p) => s + fn(p), 0) / starters.length
      : 65;

  const avgBench = (fn: (p: SimPlayer) => number) =>
    bench.length > 0
      ? bench.reduce((s, p) => s + fn(p), 0) / bench.length
      : 60;

  const avg = (fn: (p: SimPlayer) => number) =>
    avgStarter(fn) * starterWeight + avgBench(fn) * benchWeight;

  const overall = Math.round(avg(p => p.overall));

  const offense_rating = Math.round(
    avg(p => p.attr_shooting_2pt) * 0.3 +
    avg(p => p.attr_shooting_3pt) * 0.25 +
    avg(p => p.attr_iq) * 0.25 +
    avg(p => p.attr_athleticism) * 0.2
  );

  const defense_rating = Math.round(
    avg(p => p.attr_defense) * 0.5 +
    avg(p => p.attr_rebounding) * 0.3 +
    avg(p => p.attr_athleticism) * 0.2
  );

  // Pace: PGs and SGs set pace
  const guards = [...starters, ...bench].filter(p => p.position === 'PG' || p.position === 'SG');
  const pace = guards.length > 0
    ? 62 + Math.round(guards.reduce((s, p) => s + p.attr_iq, 0) / guards.length / 10)
    : 68;

  return { overall, offense_rating, defense_rating, pace };
}
