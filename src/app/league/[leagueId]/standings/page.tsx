import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface Props { params: Promise<{ leagueId: string }> }

export default async function StandingsPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: league } = await supabase.from('leagues').select('season').eq('id', leagueId).single();

  const { data: standings } = await supabase
    .from('league_standings')
    .select('*')
    .eq('league_id', leagueId)
    .eq('season', league?.season || 1)
    .order('wins', { ascending: false })
    .order('losses', { ascending: true });

  // Group by conference
  const byConf: Record<string, typeof standings> = {};
  for (const team of (standings || [])) {
    const conf = team.conference_name || 'Independents';
    if (!byConf[conf]) byConf[conf] = [];
    byConf[conf]!.push(team);
  }

  // Sort conferences with most wins first
  const confOrder = Object.entries(byConf).sort(([, a], [, b]) => {
    const avgA = (a || []).reduce((s, t) => s + t.wins, 0) / (a?.length || 1);
    const avgB = (b || []).reduce((s, t) => s + t.wins, 0) / (b?.length || 1);
    return avgB - avgA;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="fm-panel p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#e2e8f0]">Standings</h1>
        <div className="text-sm text-[#94a3b8]">Season {league?.season}</div>
      </div>

      {confOrder.map(([confName, teams]) => (
        <div key={confName} className="fm-panel">
          <div className="fm-panel-header">{confName}</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>School</th>
                <th className="hidden sm:table-cell">Coach</th>
                <th>W</th>
                <th>L</th>
                <th className="hidden sm:table-cell">Conf</th>
                <th className="hidden md:table-cell">PPG</th>
                <th className="hidden md:table-cell">PAPG</th>
                <th className="hidden sm:table-cell">Streak</th>
                <th>OVR</th>
              </tr>
            </thead>
            <tbody>
              {(teams || [])
                .sort((a, b) => {
                  const aWinPct = a.wins / Math.max(1, a.wins + a.losses);
                  const bWinPct = b.wins / Math.max(1, b.wins + b.losses);
                  return bWinPct - aWinPct;
                })
                .map((team, idx) => (
                  <tr key={team.team_id}>
                    <td className="text-[#64748b] tabular-nums">{idx + 1}</td>
                    <td>
                      <div className="font-medium">{team.short_name}</div>
                    </td>
                    <td className="hidden sm:table-cell text-[#94a3b8] text-xs">
                      {team.coach_last_name}
                    </td>
                    <td className="font-bold tabular-nums text-[#10b981]">{team.wins}</td>
                    <td className="tabular-nums text-[#94a3b8]">{team.losses}</td>
                    <td className="hidden sm:table-cell tabular-nums text-xs text-[#64748b]">
                      {team.conf_wins}-{team.conf_losses}
                    </td>
                    <td className="hidden md:table-cell tabular-nums text-sm">{team.ppg}</td>
                    <td className="hidden md:table-cell tabular-nums text-sm text-[#64748b]">{team.papg}</td>
                    <td className="hidden sm:table-cell">
                      <span className={`text-xs font-medium ${
                        team.streak_type === 'W' ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}>
                        {team.streak_type}{team.streak_count}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-bold ${
                        team.team_overall >= 85 ? 'rating-90' :
                        team.team_overall >= 75 ? 'rating-80' :
                        team.team_overall >= 65 ? 'rating-70' : 'rating-60'
                      }`}>
                        {team.team_overall}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}

      {(!standings || standings.length === 0) && (
        <div className="fm-card text-center py-12">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-[#94a3b8]">No standings yet</p>
          <p className="text-sm text-[#64748b] mt-1">Standings update after each week is processed</p>
        </div>
      )}
    </div>
  );
}
