import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CommissionerPanel from '@/components/commissioner/CommissionerPanel';

interface Props { params: Promise<{ leagueId: string }> }

export default async function CommissionerPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: member } = await supabase
    .from('league_members').select('role').eq('league_id', leagueId).eq('user_id', user.id).single();

  if (!member || !['commissioner', 'co_commish'].includes(member.role)) {
    redirect(`/league/${leagueId}`);
  }

  const [
    { data: league },
    { data: members },
    { data: teams },
    { data: rules },
    { data: auditLog },
    { data: processingLog },
  ] = await Promise.all([
    supabase.from('leagues').select('*').eq('id', leagueId).single(),
    supabase.from('league_members')
      .select('*, user_profiles(display_name), league_teams(id, schools(short_name))')
      .eq('league_id', leagueId)
      .eq('is_active', true),
    supabase.from('league_teams')
      .select('id, prestige, team_overall, is_locked, schools(short_name, conference)')
      .eq('league_id', leagueId)
      .order('prestige', { ascending: false }),
    supabase.from('league_rules').select('*').eq('league_id', leagueId),
    supabase.from('league_audit_log').select('*').eq('league_id', leagueId).order('created_at', { ascending: false }).limit(30),
    supabase.from('week_processing_log').select('*').eq('league_id', leagueId).order('created_at', { ascending: false }).limit(10),
  ]);

  return (
    <CommissionerPanel
      leagueId={leagueId}
      league={league}
      members={members || []}
      teams={teams || []}
      rules={rules || []}
      auditLog={auditLog || []}
      processingLog={processingLog || []}
      currentUserId={user.id}
      isCommissioner={member.role === 'commissioner'}
    />
  );
}
