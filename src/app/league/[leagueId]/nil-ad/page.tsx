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

  const [{ data: finances }, { data: weekState }, { data: nilDeals }, { data: lastDecision }] = await Promise.all([
    supabase.from('team_finances').select('*').eq('team_id', member.team_id).single().then(r => r),
    supabase.from('team_week_state').select('*').eq('league_id', leagueId).eq('team_id', member.team_id).eq('week', league?.current_week || 1).single().then(r => r),
    supabase.from('player_nil_deals').select('*, players(first_name, last_name, position, overall)').eq('team_id', member.team_id).eq('is_active', true),
    supabase.from('ad_decisions').select('*').eq('team_id', member.team_id).eq('season', league?.season || 1).eq('week', league?.current_week || 1).single().then(r => r),
  ]);

  return (
    <NilAdPanel
      leagueId={leagueId}
      teamId={member.team_id}
      week={league?.current_week || 1}
      finances={finances.data}
      nilDeals={nilDeals || []}
      weekState={weekState.data}
      alreadyChose={!!lastDecision.data}
      lastChoice={lastDecision.data?.choice_key}
    />
  );
}
