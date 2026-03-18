import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RecruitingBoard from '@/components/recruiting/RecruitingBoard';

interface Props { params: Promise<{ leagueId: string }> }

export default async function RecruitingPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: member } = await supabase
    .from('league_members').select('team_id').eq('league_id', leagueId).eq('user_id', user.id).single();

  if (!member?.team_id) {
    redirect(`/league/${leagueId}/team`);
  }

  const { data: league } = await supabase.from('leagues').select('current_week, season, phase').eq('id', leagueId).single();

  const [{ data: recruits }, { data: myActions }] = await Promise.all([
    supabase.from('league_recruits')
      .select('*')
      .eq('league_id', leagueId)
      .in('status', ['available', 'considering'])
      .order('stars', { ascending: false })
      .order('overall', { ascending: false })
      .limit(100),

    supabase.from('recruiting_actions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('team_id', member.team_id)
      .eq('week', league?.current_week || 1),
  ]);

  const { data: weekState } = await supabase.from('team_week_state')
    .select('*')
    .eq('league_id', leagueId)
    .eq('team_id', member.team_id)
    .eq('week', league?.current_week || 1)
    .single();

  const { data: recState } = await supabase.from('team_recruiting_state')
    .select('*')
    .eq('league_id', leagueId)
    .eq('team_id', member.team_id)
    .eq('season', league?.season || 1)
    .single();

  const pointsUsed = weekState?.recruiting_points_used || 0;
  const pointsBudget = weekState?.recruiting_points_budget || 100;
  const scholsRemaining = (recState?.scholarships_total || 13) - (recState?.scholarships_used || 0);

  return (
    <RecruitingBoard
      leagueId={leagueId}
      teamId={member.team_id}
      week={league?.current_week || 1}
      recruits={recruits || []}
      myActions={myActions || []}
      pointsUsed={pointsUsed}
      pointsBudget={pointsBudget}
      scholsRemaining={scholsRemaining}
      isReady={weekState?.is_ready || false}
    />
  );
}
