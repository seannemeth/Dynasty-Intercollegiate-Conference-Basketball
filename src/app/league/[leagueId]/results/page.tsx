import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface Props { params: Promise<{ leagueId: string }> }

export default async function ResultsPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: league } = await supabase.from('leagues').select('current_week, season').eq('id', leagueId).single();
  const currentWeek = (league?.current_week || 2) - 1; // show last completed week

  const { data: results } = await supabase
    .from('game_results')
    .select(`
      *,
      home_team:home_team_id (schools(short_name, color_primary)),
      away_team:away_team_id (schools(short_name, color_primary)),
      game:game_id (game_type, week)
    `)
    .eq('league_id', leagueId)
    .eq('season', league?.season || 1)
    .eq('week', currentWeek)
    .order('created_at', { ascending: false });

  const { data: allWeeks } = await supabase
    .from('game_results')
    .select('week')
    .eq('league_id', leagueId)
    .eq('season', league?.season || 1)
    .order('week', { ascending: false });

  const weeks = [...new Set((allWeeks || []).map(r => r.week))];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="fm-panel p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#e2e8f0]">Results</h1>
        <div className="text-sm text-[#94a3b8]">Week {currentWeek} · Season {league?.season}</div>
      </div>

      {/* Week selector */}
      {weeks.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          {weeks.map(w => (
            <a
              key={w}
              href={`/league/${leagueId}/results?week=${w}`}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                w === currentWeek
                  ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                  : 'bg-[#1e2535] border-[#2d3748] text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              Wk {w}
            </a>
          ))}
        </div>
      )}

      {/* Game results */}
      {results && results.length > 0 ? (
        <div className="space-y-3">
          {results.map((r: any) => {
            const homeWon = r.winner_team_id === r.home_team_id;
            const awayWon = r.winner_team_id === r.away_team_id;
            const homeStats = r.home_stats_json as any;
            const awayStats = r.away_stats_json as any;
            const keyPlays = (r.key_plays_json as any[]) || [];

            return (
              <div key={r.id} className="fm-panel overflow-hidden">
                {/* Score header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Home team */}
                    <div className="flex-1">
                      <div className={`text-base font-bold ${homeWon ? 'text-[#e2e8f0]' : 'text-[#64748b]'}`}>
                        {r.home_team?.schools?.short_name || 'Home'}
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">HOME</div>
                    </div>

                    {/* Score */}
                    <div className="text-center px-4">
                      <div className="text-3xl font-bold tabular-nums flex items-center gap-2">
                        <span className={homeWon ? 'text-[#10b981]' : 'text-[#94a3b8]'}>{r.home_score}</span>
                        <span className="text-[#475569] text-xl">–</span>
                        <span className={awayWon ? 'text-[#10b981]' : 'text-[#94a3b8]'}>{r.away_score}</span>
                      </div>
                      {r.overtime_periods > 0 && (
                        <div className="text-xs text-[#f59e0b] mt-0.5">
                          {r.overtime_periods === 1 ? 'OT' : `${r.overtime_periods}OT`}
                        </div>
                      )}
                    </div>

                    {/* Away team */}
                    <div className="flex-1 text-right">
                      <div className={`text-base font-bold ${awayWon ? 'text-[#e2e8f0]' : 'text-[#64748b]'}`}>
                        {r.away_team?.schools?.short_name || 'Away'}
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">AWAY</div>
                    </div>
                  </div>
                </div>

                {/* Key stats */}
                {(homeStats || awayStats) && (
                  <div className="border-t border-[#2d3748] px-4 py-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[#64748b] mb-1">Top Scorer</div>
                      <div className="text-[#e2e8f0]">{homeStats?.top_scorer}</div>
                      <div className="text-[#3b82f6] font-bold">{homeStats?.top_scorer_pts} pts</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#64748b] mb-1">Top Scorer</div>
                      <div className="text-[#e2e8f0]">{awayStats?.top_scorer}</div>
                      <div className="text-[#3b82f6] font-bold">{awayStats?.top_scorer_pts} pts</div>
                    </div>
                  </div>
                )}

                {/* Key plays */}
                {keyPlays.length > 0 && (
                  <div className="border-t border-[#2d3748] px-4 py-3">
                    <div className="text-xs text-[#64748b] uppercase tracking-wide mb-2">Key Plays</div>
                    <div className="space-y-1.5">
                      {keyPlays.slice(0, 4).map((play, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-[#475569] shrink-0 tabular-nums w-10">
                            {play.period === 1 ? '1H' : '2H'} {play.time_remaining}
                          </span>
                          <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${
                            play.type === 'score' ? 'bg-[#10b981]' :
                            play.type === 'momentum' ? 'bg-[#f59e0b]' :
                            play.type === 'turnover' ? 'bg-[#ef4444]' :
                            'bg-[#3b82f6]'
                          }`} />
                          <span className="text-[#94a3b8] leading-snug">{play.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="fm-card text-center py-12">
          <div className="text-4xl mb-3">🏀</div>
          <p className="text-[#94a3b8]">No results yet for Week {currentWeek}</p>
          <p className="text-sm text-[#64748b] mt-1">Advance the week to simulate games</p>
        </div>
      )}
    </div>
  );
}
