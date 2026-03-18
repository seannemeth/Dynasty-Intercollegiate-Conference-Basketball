'use client';

import { useState, useTransition } from 'react';
import { allocateRecruitingPoints, offerScholarship, cancelRecruitingOffer } from '@/actions/recruiting';
import StarRating from '@/components/ui/StarRating';
import RatingBubble from '@/components/ui/RatingBubble';

interface Recruit {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  stars: number;
  overall: number;
  potential: number;
  dev_trait: string;
  home_state: string | null;
  pref_prestige: number;
  pref_nil: number;
  pref_playing_time: number;
  commit_score: number;
  status: string;
  committed_to_team_id: string | null;
}

interface Action {
  recruit_id: string;
  points_spent: number;
  scholarship_offered: boolean;
  action_type: string;
}

interface Props {
  leagueId: string;
  teamId: string;
  week: number;
  recruits: Recruit[];
  myActions: Action[];
  pointsUsed: number;
  pointsBudget: number;
  scholsRemaining: number;
  isReady: boolean;
}

const POINTS_OPTIONS = [5, 10, 20, 30, 50];

export default function RecruitingBoard({
  leagueId, teamId, week, recruits, myActions, pointsUsed, pointsBudget, scholsRemaining, isReady
}: Props) {
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [filterPos, setFilterPos] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);
  const [isPending, startTransition] = useTransition();
  const [localPointsUsed, setLocalPointsUsed] = useState(pointsUsed);

  const actionMap = new Map(myActions.map(a => [a.recruit_id, a]));

  const filtered = recruits.filter(r => {
    if (filterStars !== null && r.stars !== filterStars) return false;
    if (filterPos && r.position !== filterPos) return false;
    if (search && !`${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pointsRemaining = pointsBudget - localPointsUsed;

  function handleAllocate(recruit: Recruit, points: number) {
    if (isReady) return;
    if (pointsRemaining < points) return;
    startTransition(async () => {
      setLocalPointsUsed(prev => prev + points);
      await allocateRecruitingPoints(leagueId, recruit.id, points);
    });
  }

  function handleOffer(recruit: Recruit, points: number) {
    if (isReady) return;
    if (scholsRemaining <= 0) return;
    startTransition(async () => {
      await offerScholarship(leagueId, recruit.id, points);
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Header + budget */}
      <div className="fm-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#e2e8f0]">Recruiting Board</h1>
          <div className="text-xs text-[#64748b] mt-0.5">Week {week} · Scholarship offers available</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums text-[#3b82f6]">{pointsRemaining}</div>
            <div className="text-xs text-[#64748b]">Pts Left</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums text-[#10b981]">{scholsRemaining}</div>
            <div className="text-xs text-[#64748b]">Scholarships</div>
          </div>
        </div>
      </div>

      {/* Points bar */}
      <div className="fm-panel p-3">
        <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1.5">
          <span>Points used: {localPointsUsed}/{pointsBudget}</span>
          <span>{pointsRemaining} remaining</span>
        </div>
        <div className="attr-bar h-3">
          <div
            className="attr-bar-fill bg-[#3b82f6]"
            style={{ width: `${Math.min(100, (localPointsUsed / pointsBudget) * 100)}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search recruits..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="fm-input max-w-[200px]"
        />
        <select value={filterPos} onChange={e => setFilterPos(e.target.value)} className="fm-input w-auto">
          <option value="">All Positions</option>
          {['PG','SG','SF','PF','C'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex gap-1">
          {[null,5,4,3,2,1].map(s => (
            <button
              key={String(s)}
              onClick={() => setFilterStars(s)}
              className={`px-2.5 py-1.5 text-xs rounded border transition-colors ${
                filterStars === s
                  ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                  : 'bg-[#1e2535] border-[#2d3748] text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              {s === null ? 'All' : `${s}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Recruit table */}
      <div className="fm-panel">
        <table className="fm-table">
          <thead>
            <tr>
              <th>Recruit</th>
              <th>Pos</th>
              <th>Stars</th>
              <th>OVR</th>
              <th>Dev</th>
              <th>Interest</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const myAction = actionMap.get(r.id);
              const hasOffer = myAction?.scholarship_offered;
              const myPoints = myAction?.points_spent || 0;
              const interestPct = Math.min(100, r.commit_score);

              return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedRecruit(r === selectedRecruit ? null : r)}
                  className={selectedRecruit?.id === r.id ? 'bg-[#252d40]' : ''}
                >
                  <td>
                    <div className="font-medium">{r.first_name} {r.last_name}</div>
                    <div className="text-xs text-[#64748b]">{r.home_state || '?'}</div>
                  </td>
                  <td><span className="text-xs font-mono bg-[#2d3748] px-1.5 py-0.5 rounded">{r.position}</span></td>
                  <td><StarRating value={r.stars} max={5} size="sm" /></td>
                  <td><RatingBubble value={r.overall} /></td>
                  <td><span className={`trait-${r.dev_trait}`}>{r.dev_trait}</span></td>
                  <td>
                    <div className="w-16">
                      <div className="attr-bar">
                        <div
                          className="attr-bar-fill bg-[#10b981]"
                          style={{ width: `${interestPct}%` }}
                        />
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">{interestPct}%</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {hasOffer ? (
                        <span className="badge-ready text-xs px-2 py-0.5 rounded border">Offered</span>
                      ) : (
                        !isReady && scholsRemaining > 0 && (
                          <button
                            onClick={e => { e.stopPropagation(); handleOffer(r, 15); }}
                            disabled={isPending}
                            className="btn-primary py-0.5 px-2 text-xs"
                          >
                            Offer
                          </button>
                        )
                      )}
                      {myPoints > 0 && (
                        <span className="text-xs text-[#3b82f6] font-medium">{myPoints}pts</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-8 text-center text-[#64748b] text-sm">No recruits match your filters</div>
        )}
      </div>

      {/* Detail panel when selected */}
      {selectedRecruit && (
        <div className="fm-panel p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#e2e8f0]">
                {selectedRecruit.first_name} {selectedRecruit.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono bg-[#2d3748] px-1.5 py-0.5 rounded">{selectedRecruit.position}</span>
                <StarRating value={selectedRecruit.stars} max={5} size="sm" />
                <span className={`trait-${selectedRecruit.dev_trait}`}>{selectedRecruit.dev_trait}</span>
              </div>
            </div>
            <button onClick={() => setSelectedRecruit(null)} className="text-[#64748b] hover:text-[#e2e8f0] text-xl leading-none">×</button>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Prestige', val: selectedRecruit.pref_prestige },
              { label: 'NIL Interest', val: selectedRecruit.pref_nil },
              { label: 'Playing Time', val: selectedRecruit.pref_playing_time },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-xs text-[#64748b] mb-1">{label}</div>
                <div className="attr-bar">
                  <div
                    className={`attr-bar-fill ${val >= 70 ? 'bg-[#ef4444]' : val >= 40 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">{val}/100</div>
              </div>
            ))}
          </div>

          {/* Point allocation */}
          {!isReady && (
            <div>
              <div className="text-xs text-[#94a3b8] mb-2 uppercase tracking-wide">Allocate Points ({pointsRemaining} remaining)</div>
              <div className="flex flex-wrap gap-2">
                {POINTS_OPTIONS.map(pts => (
                  <button
                    key={pts}
                    onClick={() => handleAllocate(selectedRecruit, pts)}
                    disabled={isPending || pointsRemaining < pts}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
                  >
                    +{pts} pts
                  </button>
                ))}
                {scholsRemaining > 0 && !actionMap.get(selectedRecruit.id)?.scholarship_offered && (
                  <button
                    onClick={() => handleOffer(selectedRecruit, 15)}
                    disabled={isPending}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    📜 Offer Scholarship
                  </button>
                )}
              </div>
            </div>
          )}
          {isReady && (
            <div className="badge-ready text-sm px-3 py-2 rounded border text-center">
              You marked ready — actions locked until week advances
            </div>
          )}
        </div>
      )}
    </div>
  );
}
