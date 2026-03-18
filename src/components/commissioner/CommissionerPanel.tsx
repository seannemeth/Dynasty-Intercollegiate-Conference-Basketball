'use client';

import { useState, useTransition } from 'react';
import { advanceWeek } from '@/actions/league';

interface Props {
  leagueId: string;
  league: any;
  members: any[];
  teams: any[];
  rules: any[];
  auditLog: any[];
  processingLog: any[];
  currentUserId: string;
  isCommissioner: boolean;
}

type Tab = 'overview' | 'members' | 'teams' | 'rules' | 'audit';

async function assignTeam(leagueId: string, userId: string, teamId: string) {
  const { createClient } = await import('@/lib/supabase/client');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  return supabase.rpc('rpc_commish_assign_team', { p_league_id: leagueId, p_user_id: userId, p_team_id: teamId });
}

async function lockTeam(leagueId: string, teamId: string, locked: boolean) {
  const { createClient } = await import('@/lib/supabase/client');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  return supabase.rpc('rpc_commish_lock_team', { p_league_id: leagueId, p_team_id: teamId, p_locked: locked });
}

async function editRule(leagueId: string, key: string, value: string) {
  const { createClient } = await import('@/lib/supabase/client');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  return supabase.rpc('rpc_commish_edit_rule', { p_league_id: leagueId, p_key: key, p_value: value });
}

export default function CommissionerPanel({
  leagueId, league, members, teams, rules, auditLog, processingLog, currentUserId, isCommissioner
}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  const ruleMap = new Map(rules.map(r => [r.key, r.value]));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleAdvance() {
    startTransition(async () => {
      const res = await advanceWeek(leagueId);
      if (res?.error) showToast(res.error);
      else showToast(`Week advanced! ${res.games_simmed || 0} games simmed.`);
    });
  }

  const readyCount = members.filter(m => m.team_id).length; // simplified

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members' },
    { key: 'teams', label: 'Teams' },
    { key: 'rules', label: 'Rules' },
    { key: 'audit', label: 'Audit Log' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1e2535] border border-[#3b82f6] text-[#e2e8f0] px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="fm-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#e2e8f0]">Commissioner Panel</h1>
          <div className="text-xs text-[#64748b]">{league?.name} · Season {league?.season} · Week {league?.current_week}</div>
        </div>
        <button
          onClick={handleAdvance}
          disabled={isPending}
          className="btn-primary whitespace-nowrap"
        >
          {isPending ? 'Processing...' : '▶ Advance Week'}
        </button>
      </div>

      {/* Processing log */}
      {processingLog[0] && (
        <div className={`fm-panel p-3 border-l-2 ${
          processingLog[0].status === 'completed' ? 'border-[#10b981]' :
          processingLog[0].status === 'failed' ? 'border-[#ef4444]' : 'border-[#f59e0b]'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94a3b8]">
              Last process: Wk {processingLog[0].week} — {processingLog[0].status}
              {processingLog[0].games_simmed ? ` · ${processingLog[0].games_simmed} games` : ''}
            </span>
            <span className="text-[#64748b]">
              {new Date(processingLog[0].started_at).toLocaleString()}
            </span>
          </div>
          {processingLog[0].error_msg && (
            <div className="text-xs text-[#ef4444] mt-1">{processingLog[0].error_msg}</div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#161b27] p-1 rounded-lg">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Phase', value: league?.phase?.replace('_', ' ') },
            { label: 'Week', value: league?.current_week },
            { label: 'Teams', value: teams.length },
            { label: 'Members', value: members.length },
          ].map(({ label, value }) => (
            <div key={label} className="fm-card text-center">
              <div className="stat-number">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="fm-panel">
          <div className="fm-panel-header">League Members ({members.length})</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Team</th>
                {isCommissioner && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.user_id}>
                  <td>
                    <div className="font-medium">{m.user_profiles?.display_name || 'User'}</div>
                    <div className="text-xs text-[#64748b]">{m.user_id === currentUserId ? '(you)' : ''}</div>
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      m.role === 'commissioner' ? 'badge-ready' :
                      m.role === 'co_commish' ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/20' :
                      'bg-[#2d3748] text-[#94a3b8] border-[#2d3748]'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="text-sm">
                    {m.league_teams?.schools?.short_name || <span className="text-[#64748b]">No team</span>}
                  </td>
                  {isCommissioner && m.user_id !== currentUserId && (
                    <td>
                      <select
                        className="fm-input w-auto text-xs"
                        defaultValue={m.team_id || ''}
                        onChange={async (e) => {
                          if (e.target.value) {
                            await assignTeam(leagueId, m.user_id, e.target.value);
                            showToast('Team assigned');
                          }
                        }}
                      >
                        <option value="">— Assign Team —</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {(t.schools as any)?.short_name}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Teams */}
      {tab === 'teams' && (
        <div className="fm-panel">
          <div className="fm-panel-header">All Teams</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th>School</th>
                <th>Conference</th>
                <th>OVR</th>
                <th>Status</th>
                {isCommissioner && <th>Lock</th>}
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id}>
                  <td className="font-medium">{(t.schools as any)?.short_name}</td>
                  <td className="text-[#94a3b8] text-xs">{(t.schools as any)?.conference}</td>
                  <td>
                    <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-bold ${
                      t.team_overall >= 85 ? 'rating-90' :
                      t.team_overall >= 75 ? 'rating-80' :
                      t.team_overall >= 65 ? 'rating-70' : 'rating-60'
                    }`}>{t.team_overall}</span>
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded border ${t.is_locked ? 'badge-locked' : 'badge-ready'}`}>
                      {t.is_locked ? 'Locked' : 'Open'}
                    </span>
                  </td>
                  {isCommissioner && (
                    <td>
                      <button
                        onClick={async () => {
                          await lockTeam(leagueId, t.id, !t.is_locked);
                          showToast(t.is_locked ? 'Team unlocked' : 'Team locked');
                        }}
                        className="text-xs text-[#94a3b8] hover:text-[#e2e8f0] underline"
                      >
                        {t.is_locked ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rules */}
      {tab === 'rules' && (
        <div className="fm-panel">
          <div className="fm-panel-header">League Rules</div>
          <div className="divide-y divide-[#2d3748]">
            {[
              { key: 'nil_model', label: 'NIL Model', options: ['soft_cap', 'hard_cap', 'no_cap'] },
              { key: 'nil_weekly_base', label: 'NIL Weekly Base ($)', type: 'number' },
              { key: 'portal_size_factor', label: 'Portal Size Factor', type: 'number' },
              { key: 'portal_immediate_eligibility', label: 'Immediate Eligibility', options: ['true', 'false'] },
              { key: 'recruiting_points_per_week', label: 'Recruiting Points/Week', type: 'number' },
              { key: 'allow_tampering', label: 'Allow Tampering', options: ['true', 'false'] },
            ].map(rule => (
              <div key={rule.key} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-[#e2e8f0]">{rule.label}</div>
                  <div className="text-xs text-[#64748b]">{rule.key}</div>
                </div>
                {isCommissioner ? (
                  rule.options ? (
                    <select
                      defaultValue={ruleMap.get(rule.key) || ''}
                      onChange={e => editRule(leagueId, rule.key, e.target.value).then(() => showToast('Rule updated'))}
                      className="fm-input w-auto text-xs"
                    >
                      {rule.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={rule.type || 'text'}
                      defaultValue={ruleMap.get(rule.key) || ''}
                      onBlur={e => editRule(leagueId, rule.key, e.target.value).then(() => showToast('Rule updated'))}
                      className="fm-input w-32 text-xs"
                    />
                  )
                ) : (
                  <span className="text-sm text-[#e2e8f0]">{ruleMap.get(rule.key) || '—'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {tab === 'audit' && (
        <div className="fm-panel">
          <div className="fm-panel-header">Audit Log</div>
          <div className="divide-y divide-[#2d3748]">
            {auditLog.map(log => (
              <div key={log.id} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#e2e8f0]">{log.action}</div>
                    <div className="text-xs text-[#64748b] mt-0.5 truncate">
                      {JSON.stringify(log.payload)}
                    </div>
                  </div>
                  <div className="text-xs text-[#475569] shrink-0">
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {auditLog.length === 0 && (
              <div className="px-4 py-6 text-sm text-[#64748b] text-center">No audit entries yet</div>
            )}
          </div>
        </div>
      )}

      {/* Invite code */}
      <div className="fm-panel p-4">
        <div className="text-xs text-[#64748b] mb-2 uppercase tracking-wide">Invite Code</div>
        <div className="flex items-center gap-3">
          <code className="text-xl font-mono font-bold text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-4 py-2 rounded">
            {league?.invite_code}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(league?.invite_code); showToast('Copied!'); }}
            className="btn-secondary text-xs py-2"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
