import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { claimTeam } from '@/actions/league';
import RatingBubble from '@/components/ui/RatingBubble';
import StarRating from '@/components/ui/StarRating';

interface Props { params: Promise<{ leagueId: string }> }

export default async function TeamPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: member } = await supabase
    .from('league_members').select('role, team_id').eq('league_id', leagueId).eq('user_id', user.id).single();

  if (!member) redirect('/dashboard');

  // If user has a team, show roster
  if (member.team_id) {
    return <TeamRosterView leagueId={leagueId} teamId={member.team_id} />;
  }

  // Otherwise show team picker
  return <TeamPickerView leagueId={leagueId} />;
}

async function TeamRosterView({ leagueId, teamId }: { leagueId: string; teamId: string }) {
  const supabase = await createClient();

  const [{ data: team }, { data: players }, { data: stats }] = await Promise.all([
    supabase.from('league_teams').select('*, schools(*)').eq('id', teamId).single(),
    supabase.from('players').select('*').eq('team_id', teamId).order('depth_chart_pos'),
    supabase.from('team_season_stats').select('*').eq('team_id', teamId).order('season', { ascending: false }).limit(1).single(),
  ]);

  const school = (team as any)?.schools;

  const starters = players?.filter(p => p.is_starter) || [];
  const bench = players?.filter(p => !p.is_starter) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Team header */}
      <div className="fm-panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748b]">{school?.conference}</div>
            <h1 className="text-xl font-bold text-[#e2e8f0]">{school?.name}</h1>
            <div className="text-sm text-[#94a3b8] mt-0.5">
              Coach {team?.coach_first_name} {team?.coach_last_name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
              {stats?.wins || 0}-{stats?.losses || 0}
            </div>
            <div className="text-xs text-[#64748b]">
              {stats?.conf_wins || 0}-{stats?.conf_losses || 0} conf
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#2d3748]">
          <div className="text-center">
            <div className="stat-number">{team?.team_overall}</div>
            <div className="stat-label">Overall</div>
          </div>
          <div className="text-center">
            <div className="stat-number">{team?.nil_bank ? `$${(team.nil_bank / 1000).toFixed(0)}k` : '—'}</div>
            <div className="stat-label">NIL Bank</div>
          </div>
          <div className="text-center">
            <div className="stat-number">{team?.facilities_level}/10</div>
            <div className="stat-label">Facilities</div>
          </div>
          <div className="text-center">
            <div className="stat-number">{team?.program_momentum}</div>
            <div className="stat-label">Momentum</div>
          </div>
        </div>
      </div>

      {/* Starters */}
      <div className="fm-panel">
        <div className="fm-panel-header">Starting Five</div>
        <table className="fm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Pos</th>
              <th>Yr</th>
              <th>OVR</th>
              <th>POT</th>
              <th className="hidden sm:table-cell">Dev</th>
            </tr>
          </thead>
          <tbody>
            {starters.map(p => (
              <tr key={p.id}>
                <td className="text-[#64748b] w-8">{p.jersey_number || '—'}</td>
                <td className="font-medium">{p.first_name} {p.last_name}</td>
                <td><span className="text-xs font-mono bg-[#2d3748] px-1.5 py-0.5 rounded">{p.position}</span></td>
                <td className="text-[#94a3b8]">{p.year}</td>
                <td><RatingBubble value={p.overall} /></td>
                <td className="text-[#94a3b8]">{p.potential}</td>
                <td className="hidden sm:table-cell">
                  <span className={`trait-${p.dev_trait}`}>{p.dev_trait}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bench */}
      {bench.length > 0 && (
        <div className="fm-panel">
          <div className="fm-panel-header">Bench</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Pos</th>
                <th>Yr</th>
                <th>OVR</th>
                <th>POT</th>
              </tr>
            </thead>
            <tbody>
              {bench.map(p => (
                <tr key={p.id} className="opacity-80">
                  <td className="text-[#64748b] w-8">{p.jersey_number || '—'}</td>
                  <td className="font-medium">{p.first_name} {p.last_name}</td>
                  <td><span className="text-xs font-mono bg-[#2d3748] px-1.5 py-0.5 rounded">{p.position}</span></td>
                  <td className="text-[#94a3b8]">{p.year}</td>
                  <td><RatingBubble value={p.overall} /></td>
                  <td className="text-[#94a3b8]">{p.potential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function TeamPickerView({ leagueId }: { leagueId: string }) {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from('league_teams')
    .select(`
      id, prestige, team_overall, is_locked, wins, losses,
      coach_first_name, coach_last_name,
      schools (name, short_name, conference, color_primary),
      league_members (user_id)
    `)
    .eq('league_id', leagueId)
    .order('prestige', { ascending: false });

  // Group by conference
  const byConf: Record<string, typeof teams> = {};
  for (const t of (teams || [])) {
    const conf = (t.schools as any)?.conference || 'Other';
    if (!byConf[conf]) byConf[conf] = [];
    byConf[conf]!.push(t);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold text-[#e2e8f0]">Pick Your Team</h1>
      <p className="text-sm text-[#94a3b8]">Choose from all {teams?.length} D1 programs. Teams marked in green are available.</p>

      {Object.entries(byConf).sort(([a], [b]) => a.localeCompare(b)).map(([conf, confTeams]) => (
        <div key={conf} className="fm-panel">
          <div className="fm-panel-header">{conf}</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th>School</th>
                <th>OVR</th>
                <th>Prestige</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {confTeams!.map((t: any) => {
                const claimed = t.league_members && t.league_members.length > 0;
                const locked = t.is_locked;
                return (
                  <tr key={t.id} className={locked || claimed ? 'opacity-50' : ''}>
                    <td>
                      <div className="font-medium">{t.schools?.short_name}</div>
                      <div className="text-xs text-[#64748b]">{t.coach_first_name} {t.coach_last_name}</div>
                    </td>
                    <td><RatingBubble value={t.team_overall} /></td>
                    <td><StarRating value={t.prestige} max={5} /></td>
                    <td>
                      {locked ? (
                        <span className="badge-locked text-xs px-2 py-0.5 rounded border">Locked</span>
                      ) : claimed ? (
                        <span className="badge-waiting text-xs px-2 py-0.5 rounded border">Claimed</span>
                      ) : (
                        <span className="badge-ready text-xs px-2 py-0.5 rounded border">Available</span>
                      )}
                    </td>
                    <td>
                      {!claimed && !locked && (
                        <form action={async () => {
                          'use server';
                          await claimTeam(leagueId, t.id);
                        }}>
                          <button type="submit" className="btn-primary py-1 px-3 text-xs">
                            Claim
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
