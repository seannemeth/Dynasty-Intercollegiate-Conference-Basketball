import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { markReady, advanceWeek } from '@/actions/league';

interface Props {
  params: Promise<{ leagueId: string }>;
}

export default async function LeagueHubPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const [
    { data: league },
    { data: member },
    { data: readyStatus },
    { data: recentNews },
  ] = await Promise.all([
    supabase.from('leagues').select('*, league_rules(key, value)').eq('id', leagueId).single(),
    supabase.from('league_members').select('role, team_id').eq('league_id', leagueId).eq('user_id', user.id).single(),
    supabase.from('league_ready_status').select('*').eq('league_id', leagueId),
    supabase.from('news_feed_items').select('*').eq('league_id', leagueId).order('created_at', { ascending: false }).limit(10),
  ]);

  const { data: recentResults } = await supabase.from('game_results')
    .select('*, home_team:home_team_id(schools(short_name)), away_team:away_team_id(schools(short_name))')
    .eq('league_id', leagueId)
    .eq('season', (league as any)?.season || 1)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!league || !member) redirect('/dashboard');

  const isCommish = ['commissioner', 'co_commish'].includes(member.role);
  const readyCount = readyStatus?.filter(r => r.is_ready).length || 0;
  const totalWithTeams = readyStatus?.filter(r => r.team_id).length || 0;
  const allReady = readyCount > 0 && readyCount === totalWithTeams;

  // Get user's own ready status
  const myStatus = readyStatus?.find(r => r.user_id === user.id);
  const myWeekState = member.team_id ? await supabase
    .from('team_week_state')
    .select('*')
    .eq('league_id', leagueId)
    .eq('team_id', member.team_id)
    .eq('week', league.current_week)
    .single()
    .then(r => r.data) : null;

  const phaseMap: Record<string, string> = {
    setup: 'League Setup',
    preseason: 'Preseason',
    regular_season: `Week ${league.current_week} — Regular Season`,
    conf_tournament: 'Conference Tournament',
    nat_tournament: 'National Championship Tournament',
    offseason: 'Offseason',
  };
  const phaseLabel = phaseMap[league.phase] || league.phase;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Phase header */}
      <div className="fm-panel">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[#64748b] uppercase tracking-wide">Season {league.season}</div>
            <h1 className="text-lg font-bold text-[#e2e8f0] mt-0.5">{phaseLabel}</h1>
            <div className="text-xs text-[#94a3b8] mt-1">
              {league.advance_mode === 'manual' ? 'Manual advance by commissioner' :
               league.advance_mode === 'auto_all_ready' ? 'Advances when all teams ready' :
               `Auto-advance every ${league.advance_timer_hours}h`}
            </div>
          </div>
          <div className="flex gap-2">
            {!myStatus?.is_ready && member.team_id && league.phase !== 'setup' && (
              <form action={async () => {
                'use server';
                await markReady(leagueId);
              }}>
                <button type="submit" className="btn-success pulse-ready whitespace-nowrap">
                  ✓ Mark Ready
                </button>
              </form>
            )}
            {isCommish && (
              <form action={async () => {
                'use server';
                await advanceWeek(leagueId);
              }}>
                <button type="submit" className={`whitespace-nowrap ${allReady ? 'btn-primary' : 'btn-secondary'}`}>
                  Advance Week →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ready Status */}
        <div className="fm-panel">
          <div className="fm-panel-header">
            Ready Status — {readyCount}/{totalWithTeams}
          </div>
          <div className="divide-y divide-[#2d3748]">
            {readyStatus?.filter(r => r.team_id).map(r => (
              <div key={r.user_id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#e2e8f0] font-medium">
                    {r.display_name || 'Anonymous'}
                    {r.user_id === user.id && <span className="text-xs text-[#64748b] ml-1">(you)</span>}
                  </div>
                  <div className="text-xs text-[#64748b]">{r.team_name || 'No team'}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${r.is_ready ? 'badge-ready' : 'badge-waiting'}`}>
                  {r.is_ready ? 'Ready' : 'Waiting'}
                </span>
              </div>
            ))}
            {totalWithTeams === 0 && (
              <div className="px-4 py-4 text-sm text-[#64748b] text-center">No teams assigned yet</div>
            )}
          </div>
        </div>

        {/* News Feed */}
        <div className="fm-panel">
          <div className="fm-panel-header">Latest News</div>
          <div className="divide-y divide-[#2d3748]">
            {recentNews?.map(item => (
              <div key={item.id} className="px-4 py-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">
                    {item.type === 'game_result' ? '🏀' :
                     item.type === 'recruit_commit' ? '✍️' :
                     item.type === 'portal_move' ? '🔄' :
                     item.type === 'injury' ? '🩹' : '📢'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-[#e2e8f0] leading-snug">{item.headline}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">Wk {item.week}</p>
                  </div>
                  {item.importance >= 4 && (
                    <span className="shrink-0 text-xs bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20 px-1.5 py-0.5 rounded">
                      BIG
                    </span>
                  )}
                </div>
              </div>
            ))}
            {(!recentNews || recentNews.length === 0) && (
              <div className="px-4 py-6 text-sm text-[#64748b] text-center">
                No news yet. Advance the first week to generate results.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scores */}
      {recentResults && recentResults.length > 0 && (
        <div className="fm-panel">
          <div className="fm-panel-header">Recent Scores</div>
          <div className="divide-y divide-[#2d3748]">
            {recentResults.map((r: any) => (
              <div key={r.id} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-sm font-semibold ${r.winner_team_id === r.home_team_id ? 'text-[#e2e8f0]' : 'text-[#64748b]'}`}>
                    {r.home_team?.schools?.short_name || 'Home'}
                  </span>
                  <span className="text-xs text-[#64748b]">vs</span>
                  <span className={`text-sm font-semibold ${r.winner_team_id === r.away_team_id ? 'text-[#e2e8f0]' : 'text-[#64748b]'}`}>
                    {r.away_team?.schools?.short_name || 'Away'}
                  </span>
                </div>
                <div className="text-sm font-bold tabular-nums text-[#e2e8f0] shrink-0">
                  <span className={r.winner_team_id === r.home_team_id ? 'text-[#10b981]' : 'text-[#94a3b8]'}>{r.home_score}</span>
                  <span className="text-[#475569] mx-1">-</span>
                  <span className={r.winner_team_id === r.away_team_id ? 'text-[#10b981]' : 'text-[#94a3b8]'}>{r.away_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions for users without a team */}
      {!member.team_id && (
        <div className="fm-panel p-6 text-center">
          <div className="text-3xl mb-2">🏀</div>
          <h3 className="font-semibold text-[#e2e8f0] mb-1">Pick Your Team</h3>
          <p className="text-sm text-[#64748b] mb-4">Browse all 362 D1 programs and claim yours.</p>
          <Link href={`/league/${leagueId}/team`} className="btn-primary inline-flex">
            Browse Teams
          </Link>
        </div>
      )}
    </div>
  );
}
