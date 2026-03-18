import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NilAdPanel from '@/components/nil/NilAdPanel';

interface Props { params: Promise<{ leagueId: string }> }

export default async function NilAdPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: member } = await supabase
    .from('league_members').select('team_id').eq('league_id', leagueId).eq('user_id', user.id).single();
  if (!member?.team_id) redirect(`/league/${leagueId}/team`);

  const { data: league } = await supabase.from('leagues').select('current_week, season').eq('id', leagueId).single();

  const [{ data: finances }, { data: nilDeals }] = await Promise.all([
    supabase.from('team_finances').select('*').eq('team_id', member.team_id).single(),
    supabase.from('player_nil_deals').select('*, players(first_name, last_name, position, overall)').eq('team_id', member.team_id).eq('is_active', true),
  ]);

  const { data: weekState } = await supabase.from('team_week_state')
    .select('*').eq('league_id', leagueId).eq('team_id', member.team_id).eq('week', league?.current_week || 1).single();

  const { data: lastDecision } = await supabase.from('ad_decisions')
    .select('*').eq('team_id', member.team_id).eq('season', league?.season || 1).eq('week', league?.current_week || 1).single();

  return (
    <NilAdPanel
      leagueId={leagueId}
      teamId={member.team_id}
      week={league?.current_week || 1}
      finances={finances}
      nilDeals={nilDeals || []}
      weekState={weekState}
      alreadyChose={!!lastDecision}
      lastChoice={lastDecision?.choice_key}
    />
  );
}
