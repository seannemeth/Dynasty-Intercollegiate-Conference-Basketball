'use client';

import { useState, useTransition } from 'react';
import { submitAdDecision } from '@/actions/league';

function fmt(n: number): string {
  if (!n) return '$0';
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  return `$${(n/1000).toFixed(0)}k`;
}

const AD_CHOICES = [
  {
    key: 'facilities_boost',
    label: '🏋️ Facilities Investment',
    description: 'Funnel budget into facility upgrades. Boosts recruiting appeal and player development.',
    effect: '+1 Facilities Level, +5 Momentum',
    risk: 'Low',
    riskColor: 'text-[#10b981]',
  },
  {
    key: 'nil_boost',
    label: '💰 NIL Collective Drive',
    description: 'Activate boosters for an injection of NIL collective funding this week.',
    effect: '+$25k NIL, +2 Momentum',
    risk: 'Low',
    riskColor: 'text-[#10b981]',
  },
  {
    key: 'marketing',
    label: '📢 Marketing Campaign',
    description: 'Invest in fan engagement and program visibility. Lifts fan interest and momentum.',
    effect: '+10 Momentum, +8 Fan Interest',
    risk: 'None',
    riskColor: 'text-[#64748b]',
  },
  {
    key: 'compliance_risk',
    label: '⚡ Aggressive NIL Push',
    description: 'Push boundaries of NIL rules for a big funding boost. Risk of compliance investigation.',
    effect: '+$50k NIL',
    risk: 'High',
    riskColor: 'text-[#ef4444]',
  },
];

interface Props {
  leagueId: string;
  teamId: string;
  week: number;
  finances: any;
  nilDeals: any[];
  weekState: any;
  alreadyChose: boolean;
  lastChoice?: string;
}

export default function NilAdPanel({ leagueId, teamId, week, finances, nilDeals, weekState, alreadyChose, lastChoice }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(alreadyChose);
  const [submittedKey, setSubmittedKey] = useState(lastChoice || null);

  function handleSubmit() {
    if (!selected) return;
    const choice = AD_CHOICES.find(c => c.key === selected)!;
    startTransition(async () => {
      await submitAdDecision(leagueId, selected, choice.label);
      setSubmitted(true);
      setSubmittedKey(selected);
    });
  }

  const nilBank = finances?.nil_bank || 0;
  const nilIncome = finances?.nil_weekly_income || 0;
  const nilCommitted = finances?.nil_committed_weekly || 0;
  const totalNilDeal = nilDeals.reduce((s: number, d: any) => s + (d.weekly_amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="fm-panel p-4">
        <h1 className="text-lg font-bold text-[#e2e8f0] mb-1">NIL & Athletic Department</h1>
        <div className="text-xs text-[#64748b]">Week {week} decisions — choose one action</div>
      </div>

      {/* Finances overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'NIL Bank', value: fmt(nilBank), color: '#10b981' },
          { label: 'Weekly Income', value: fmt(nilIncome), color: '#3b82f6' },
          { label: 'Committed/wk', value: fmt(nilCommitted), color: '#f59e0b' },
          { label: 'Available', value: fmt(Math.max(0, nilBank - nilCommitted)), color: '#e2e8f0' },
        ].map(({ label, value, color }) => (
          <div key={label} className="fm-card text-center">
            <div className="text-xl font-bold tabular-nums" style={{ color }}>{value}</div>
            <div className="text-xs text-[#64748b] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Active NIL Deals */}
      {nilDeals.length > 0 && (
        <div className="fm-panel">
          <div className="fm-panel-header">Active NIL Deals ({nilDeals.length})</div>
          <table className="fm-table">
            <thead><tr><th>Player</th><th>Pos</th><th>OVR</th><th>Weekly</th></tr></thead>
            <tbody>
              {nilDeals.map((d: any) => (
                <tr key={d.id}>
                  <td className="font-medium">{d.players?.first_name} {d.players?.last_name}</td>
                  <td><span className="text-xs font-mono bg-[#2d3748] px-1.5 py-0.5 rounded">{d.players?.position}</span></td>
                  <td>{d.players?.overall}</td>
                  <td className="text-[#10b981] font-medium">{fmt(d.weekly_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AD Decision */}
      <div className="fm-panel">
        <div className="fm-panel-header">Weekly AD Decision</div>
        <div className="p-4">
          {submitted ? (
            <div className="fm-card text-center py-6">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-[#e2e8f0]">
                {AD_CHOICES.find(c => c.key === submittedKey)?.label || 'Decision submitted'}
              </div>
              <div className="text-sm text-[#94a3b8] mt-1">
                Decision locked in for Week {week}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {AD_CHOICES.map(choice => (
                  <button
                    key={choice.key}
                    onClick={() => setSelected(choice.key)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selected === choice.key
                        ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                        : 'border-[#2d3748] bg-[#1e2535] hover:border-[#3a4560]'
                    }`}
                  >
                    <div className="font-semibold text-[#e2e8f0] mb-1">{choice.label}</div>
                    <div className="text-xs text-[#94a3b8] mb-2 leading-snug">{choice.description}</div>
                    <div className="text-xs text-[#10b981] mb-1">Effect: {choice.effect}</div>
                    <div className={`text-xs ${choice.riskColor}`}>Risk: {choice.risk}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selected || isPending}
                className="btn-primary w-full"
              >
                {isPending ? 'Submitting...' : 'Confirm Decision'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
