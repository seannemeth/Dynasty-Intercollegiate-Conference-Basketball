// ============================================================
// Recruiting Logic
// Processes weekly recruiting actions and determines commits
// ============================================================

export interface RecruitState {
  recruit_id: string;
  stars: number;
  overall: number;
  pref_proximity: number;   // 0-100
  pref_prestige: number;
  pref_nil: number;
  pref_playing_time: number;
  pref_coach_stability: number;
  home_state?: string;
  commit_score: number;     // 0-100 — how close to committing
  status: 'available' | 'considering' | 'committed' | 'signed' | 'passed';
  committed_to_team_id?: string;
}

export interface TeamRecruitingOffer {
  team_id: string;
  points_allocated: number;
  scholarship_offered: boolean;
  nil_offered: number;
  team_prestige: number;    // 1-5
  team_state?: string;
  coach_prestige: number;
  facilities_level: number;
  scholarships_remaining: number;
}

export interface RecruitingResult {
  recruit_id: string;
  committed_to_team_id?: string;
  outcome: 'commit' | 'decommit' | 'still_considering' | 'passed';
  commit_score_delta: number;
  notes: string;
}

// Seeded PRNG
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

/**
 * Calculate how attractive a team is to a recruit (0-100 score)
 */
export function teamAttractionScore(
  recruit: RecruitState,
  offer: TeamRecruitingOffer,
  week: number
): number {
  let score = 0;
  const w = (weight: number, val: number) => weight * (val / 100);

  // Points allocated (effort signal) — up to 30 pts
  score += Math.min(30, (offer.points_allocated / 100) * 30);

  // Scholarship required
  if (!offer.scholarship_offered) score -= 20;
  if (offer.scholarships_remaining <= 0) return 0; // can't offer

  // Prestige match
  const prestigePref = recruit.pref_prestige;
  const prestigeScore = offer.team_prestige * 20; // 20-100
  score += w(20, prestigePref) * (prestigeScore / 100) * 100;

  // NIL match
  const nilNorm = Math.min(100, (offer.nil_offered / 100000) * 50); // $100k = 50 pts
  score += w(15, recruit.pref_nil) * nilNorm;

  // Playing time (inversely related to team prestige for non-stars)
  const ptScore = recruit.stars >= 4
    ? offer.team_prestige * 15
    : (5 - offer.team_prestige) * 20;
  score += w(15, recruit.pref_playing_time) * ptScore;

  // Coach stability
  score += w(10, recruit.pref_coach_stability) * (offer.coach_prestige * 20);

  // Facilities
  score += w(5, 50) * (offer.facilities_level * 10);

  // Proximity (simplified — same state = bonus)
  if (recruit.home_state && offer.team_state && recruit.home_state === offer.team_state) {
    score += (recruit.pref_proximity / 100) * 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Process recruiting for one week across all recruits in a league
 */
export function processRecruitingWeek(
  recruits: RecruitState[],
  offers: Map<string, TeamRecruitingOffer[]>, // recruid_id -> offers
  week: number,
  signingWeek: number,
  seed: number
): RecruitingResult[] {
  const rand = seededRand(seed);
  const results: RecruitingResult[] = [];

  for (const recruit of recruits) {
    if (recruit.status === 'committed' || recruit.status === 'signed' || recruit.status === 'passed') {
      continue;
    }

    const teamOffers = offers.get(recruit.recruit_id) || [];
    const validOffers = teamOffers.filter(o => o.scholarship_offered && o.scholarships_remaining > 0);

    if (validOffers.length === 0) {
      // No valid offers — eventually passes
      if (week > signingWeek) {
        results.push({
          recruit_id: recruit.recruit_id,
          outcome: 'passed',
          commit_score_delta: 0,
          notes: 'No scholarship offers received',
        });
      }
      continue;
    }

    // Score each offer
    const scored = validOffers.map(o => ({
      offer: o,
      score: teamAttractionScore(recruit, o, week) + (rand() - 0.5) * 15, // ±15 randomness
    })).sort((a, b) => b.score - a.score);

    const topOffer = scored[0];
    const topScore = topOffer.score;

    // Commit threshold: higher stars require higher score
    const commitThreshold = 60 + (recruit.stars - 1) * 8; // 60-92

    // Build commit score toward leader
    const delta = (topScore - recruit.commit_score) * 0.3 + rand() * 5;
    const newCommitScore = Math.min(100, recruit.commit_score + delta);

    if (newCommitScore >= commitThreshold && week >= 3) {
      // Commit!
      results.push({
        recruit_id: recruit.recruit_id,
        committed_to_team_id: topOffer.offer.team_id,
        outcome: 'commit',
        commit_score_delta: delta,
        notes: `Committed! Attracted by ${topOffer.offer.team_prestige >= 4 ? 'prestige' : 'playing time opportunity'}`,
      });
    } else if (week >= signingWeek) {
      // Signing week — force decision
      if (topScore >= 40) {
        results.push({
          recruit_id: recruit.recruit_id,
          committed_to_team_id: topOffer.offer.team_id,
          outcome: 'commit',
          commit_score_delta: delta,
          notes: 'Signed during signing period',
        });
      } else {
        results.push({
          recruit_id: recruit.recruit_id,
          outcome: 'passed',
          commit_score_delta: 0,
          notes: 'Signed elsewhere or went undrafted',
        });
      }
    } else {
      results.push({
        recruit_id: recruit.recruit_id,
        outcome: 'still_considering',
        commit_score_delta: delta,
        notes: `Showing ${topScore >= 70 ? 'strong' : 'moderate'} interest`,
      });
    }
  }

  return results;
}

/**
 * Generate commit odds display (for UI)
 * Returns percentage per team [0-100]
 */
export function getCommitOdds(
  recruit: RecruitState,
  offers: TeamRecruitingOffer[]
): Array<{ team_id: string; odds: number }> {
  if (offers.length === 0) return [];

  const scores = offers.map(o => ({
    team_id: o.team_id,
    score: Math.max(0, teamAttractionScore(recruit, o, 1)),
  }));

  const total = scores.reduce((s, x) => s + x.score, 0);
  if (total === 0) return scores.map(s => ({ team_id: s.team_id, odds: 0 }));

  return scores.map(s => ({
    team_id: s.team_id,
    odds: Math.round((s.score / total) * 100),
  }));
}
