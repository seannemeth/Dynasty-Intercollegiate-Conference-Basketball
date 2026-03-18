import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LeagueNav from '@/components/nav/LeagueNav';

interface Props {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}

export default async function LeagueLayout({ children, params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // Load league + member
  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, phase, current_week, season')
    .eq('id', leagueId)
    .single();

  if (!league) redirect('/dashboard');

  const { data: member } = await supabase
    .from('league_members')
    .select('role, team_id')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single();

  if (!member) redirect('/dashboard');

  // Load team info if assigned
  let teamName = null;
  if (member.team_id) {
    const { data: team } = await supabase
      .from('league_teams')
      .select('schools(short_name)')
      .eq('id', member.team_id)
      .single();
    teamName = (team?.schools as any)?.short_name;
  }

  const isCommish = ['commissioner', 'co_commish'].includes(member.role);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <LeagueNav
        leagueId={leagueId}
        leagueName={league.name}
        teamName={teamName}
        phase={league.phase}
        week={league.current_week}
        season={league.season}
        isCommish={isCommish}
        hasTeam={!!member.team_id}
      />
      <main className="flex-1 pb-20 md:pb-0 md:ml-56">
        {children}
      </main>
    </div>
  );
}
