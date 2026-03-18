'use client';

import { useState, useTransition } from 'react';
import { makePortalOffer } from '@/actions/recruiting';
import RatingBubble from '@/components/ui/RatingBubble';

interface PortalEntry {
  id: string;
  player_id: string;
  entered_week: number;
  nil_ask: number;
  players: { first_name: string; last_name: string; position: string; overall: number; potential: number; dev_trait: string; year: string } | null;
  from_team: { schools: { short_name: string } | null } | null;
}

interface Props {
  leagueId: string;
  teamId: string;
  week: number;
  entries: PortalEntry[];
  myOfferMap: Map<string, { nil_offer: number; status: string }>;
  nilBank: number;
  nilCap: number;
  nilCommitted: number;
  myPlayers: Array<{ id: string; first_name: string; last_name: string; position: string; overall: number; morale: number; in_portal: boolean }>;
}

const NIL_PRESETS = [10000, 25000, 50000, 100000, 200000];

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}k`;
  return `$${n}`;
}

export default function PortalBoard({ leagueId, teamId, week, entries, myOfferMap, nilBank, nilCap, nilCommitted, myPlayers }: Props) {
  const [filterPos, setFilterPos] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<PortalEntry | null>(null);
  const [customNil, setCustomNil] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  const filtered = entries.filter(e => !filterPos || e.players?.position === filterPos);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleOffer(entry: PortalEntry, nilOffer: number) {
    if (nilOffer > nilBank) {
      showToast('Insufficient NIL bank');
      return;
    }
    startTransition(async () => {
      const res = await makePortalOffer(leagueId, entry.id, nilOffer);
      if (res?.error) showToast(res.error);
      else showToast(`Offer submitted: ${formatMoney(nilOffer)}`);
      setSelectedEntry(null);
    });
  }

  const nilAvailable = nilBank - nilCommitted;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1e2535] border border-[#3b82f6] text-[#e2e8f0] px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="fm-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#e2e8f0]">Transfer Portal</h1>
          <div className="text-xs text-[#64748b] mt-0.5">{entries.length} players available · Week {week}</div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-lg font-bold tabular-nums text-[#10b981]">{formatMoney(nilAvailable)}</div>
            <div className="text-xs text-[#64748b]">Available NIL</div>
          </div>
          <div>
            <div className="text-lg font-bold tabular-nums text-[#f59e0b]">{formatMoney(nilCommitted)}/wk</div>
            <div className="text-xs text-[#64748b]">Committed</div>
          </div>
        </div>
      </div>

      {/* NIL bar */}
      <div className="fm-panel p-3">
        <div className="flex justify-between text-xs text-[#94a3b8] mb-1.5">
          <span>NIL Bank</span>
          <span>{formatMoney(nilBank)}</span>
        </div>
        <div className="attr-bar h-3">
          <div
            className="attr-bar-fill bg-gradient-to-r from-[#10b981] to-[#3b82f6]"
            style={{ width: `${Math.min(100, (nilBank / (nilCap * 10)) * 100)}%` }}
          />
        </div>
      </div>

      {/* My players at risk */}
      {myPlayers.some(p => p.morale < 50 || p.in_portal) && (
        <div className="fm-panel border-[#f59e0b]/30">
          <div className="fm-panel-header text-[#f59e0b]">⚠ Players at Risk</div>
          <div className="divide-y divide-[#2d3748]">
            {myPlayers.filter(p => p.morale < 50 || p.in_portal).map(p => (
              <div key={p.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{p.first_name} {p.last_name}</span>
                  <span className="text-xs text-[#64748b] ml-2">{p.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.in_portal ? (
                    <span className="badge-locked text-xs px-2 py-0.5 rounded border">In Portal</span>
                  ) : (
                    <span className="badge-waiting text-xs px-2 py-0.5 rounded border">Low Morale: {p.morale}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <select value={filterPos} onChange={e => setFilterPos(e.target.value)} className="fm-input w-auto">
          <option value="">All Positions</option>
          {['PG','SG','SF','PF','C'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Portal entries table */}
      <div className="fm-panel">
        <table className="fm-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>Yr</th>
              <th>OVR</th>
              <th>Dev</th>
              <th>NIL Ask</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => {
              const p = entry.players;
              const myOffer = myOfferMap.get(entry.id);
              const fromTeam = (entry.from_team as any)?.schools?.short_name;

              return (
                <tr
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry === selectedEntry ? null : entry)}
                  className={selectedEntry?.id === entry.id ? 'bg-[#252d40]' : ''}
                >
                  <td>
                    <div className="font-medium">{p?.first_name} {p?.last_name}</div>
                    {fromTeam && <div className="text-xs text-[#64748b]">From {fromTeam}</div>}
                  </td>
                  <td><span className="text-xs font-mono bg-[#2d3748] px-1.5 py-0.5 rounded">{p?.position}</span></td>
                  <td className="text-[#94a3b8]">{p?.year}</td>
                  <td><RatingBubble value={p?.overall || 0} /></td>
                  <td><span className={`trait-${p?.dev_trait}`}>{p?.dev_trait}</span></td>
                  <td className="text-[#f59e0b] font-medium text-sm">
                    {entry.nil_ask > 0 ? formatMoney(entry.nil_ask) : 'Flexible'}
                  </td>
                  <td>
                    {myOffer ? (
                      <span className="badge-ready text-xs px-2 py-0.5 rounded border">
                        Offered {formatMoney(myOffer.nil_offer)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#64748b]">No offer</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-8 text-center text-[#64748b] text-sm">No players in the portal</div>
        )}
      </div>

      {/* Offer panel */}
      {selectedEntry && (
        <div className="fm-panel p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#e2e8f0]">
                {selectedEntry.players?.first_name} {selectedEntry.players?.last_name}
              </h3>
              <div className="text-sm text-[#94a3b8] mt-0.5">
                {selectedEntry.players?.position} · OVR {selectedEntry.players?.overall} · {selectedEntry.players?.year}
              </div>
              {selectedEntry.nil_ask > 0 && (
                <div className="text-sm text-[#f59e0b] mt-1">
                  Asking {formatMoney(selectedEntry.nil_ask)}/wk
                </div>
              )}
            </div>
            <button onClick={() => setSelectedEntry(null)} className="text-[#64748b] hover:text-[#e2e8f0] text-xl">×</button>
          </div>

          <div>
            <div className="text-xs text-[#94a3b8] mb-2 uppercase tracking-wide">NIL Offer</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {NIL_PRESETS.map(amt => (
                <button
                  key={amt}
                  onClick={() => handleOffer(selectedEntry, amt)}
                  disabled={isPending || amt > nilAvailable}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
                >
                  {formatMoney(amt)}/wk
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Custom amount"
                value={customNil}
                onChange={e => setCustomNil(e.target.value)}
                className="fm-input max-w-[160px]"
              />
              <button
                onClick={() => customNil && handleOffer(selectedEntry, parseInt(customNil))}
                disabled={isPending || !customNil}
                className="btn-primary px-4"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
