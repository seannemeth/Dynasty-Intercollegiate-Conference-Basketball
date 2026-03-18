import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createLeague, joinLeague } from '@/actions/league';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // Load user's leagues
  const { data: memberships } = await supabase
    .from('league_members')
    .select(`
      role, team_id, is_active,
      leagues (id, name, phase, current_week, season, invite_code, advance_mode)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('joined_at', { ascending: false });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name || user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Top bar */}
      <header className="bg-[#161b27] border-b border-[#2d3748] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏀</span>
          <span className="font-bold text-[#e2e8f0]">Dynasty Hoops</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#94a3b8]">{displayName}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-xs text-[#64748b] hover:text-[#ef4444] transition-colors">Sign out</button>
          </form>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#e2e8f0] mb-6">Your Leagues</h2>

        {/* League list */}
        {memberships && memberships.length > 0 ? (
          <div className="space-y-3 mb-8">
            {memberships.map((m: any) => {
              const league = m.leagues;
              return (
                <Link
                  key={league.id}
                  href={`/league/${league.id}`}
                  className="block fm-card hover:bg-[#252d40] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#e2e8f0]">{league.name}</div>
                      <div className="text-xs text-[#64748b] mt-0.5">
                        Season {league.season} · Week {league.current_week} · {league.phase.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        m.role === 'commissioner' ? 'badge-ready' :
                        m.role === 'co_commish' ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/20' :
                        'bg-[#2d3748] text-[#94a3b8] border-[#2d3748]'
                      }`}>
                        {m.role === 'commissioner' ? 'Commish' :
                         m.role === 'co_commish' ? 'Co-Commish' : 'Member'}
                      </span>
                      {!m.team_id && (
                        <span className="text-xs text-[#f59e0b]">Pick a team</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="fm-card text-center py-12 mb-8">
            <div className="text-4xl mb-3">🏀</div>
            <p className="text-[#94a3b8]">No leagues yet</p>
            <p className="text-sm text-[#64748b] mt-1">Create or join a league below</p>
          </div>
        )}

        {/* Create + Join */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Create League */}
          <div className="fm-panel">
            <div className="fm-panel-header">Create League</div>
            <form action={createLeague as unknown as (formData: FormData) => void} className="p-4 space-y-3">
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1.5">League Name</label>
                <input name="name" required placeholder="My Basketball Dynasty" className="fm-input" />
              </div>
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1.5">Advance Mode</label>
                <select name="advance_mode" className="fm-input">
                  <option value="manual">Manual (Commissioner)</option>
                  <option value="auto_all_ready">Auto when all ready</option>
                  <option value="auto_timer">Auto timer (48h)</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                Create League
              </button>
            </form>
          </div>

          {/* Join League */}
          <div className="fm-panel">
            <div className="fm-panel-header">Join League</div>
            <form action={joinLeague as unknown as (formData: FormData) => void} className="p-4 space-y-3">
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1.5">Invite Code</label>
                <input
                  name="invite_code"
                  required
                  placeholder="ABC12345"
                  maxLength={8}
                  className="fm-input uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="pt-6">
                <button type="submit" className="btn-secondary w-full">
                  Join League
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
