import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PortalBoard from '@/components/portal/PortalBoard';

interface Props { params: Promise<{ leagueId: string }> }

export default async function PortalPage({ params }: Props) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: member } = await supabase
    .from('league_members').select('team_id').eq('league_id', leagueId).eq('user_id', user.id).single();
  if (!member?.team_id) redirect(`/league/${leagueId}/team`);

  const { data: league } = await supabase.from('leagues').select('current_week, season').eq('id', leagueId).single();

  const [{ data: entries }, { data: myOffers }, { data: finances }, { data: myPlayers }] = await Promise.all([
    supabase.from('portal_entries')
      .select('*, players(first_name, last_name, position, overall, potential, dev_trait, attr_shooting_2pt, attr_shooting_3pt, attr_defense, year), from_team:from_team_id(schools(short_name))')
      .eq('league_id', leagueId)
      .eq('status', 'open')
      .order('created_at', { ascending: false }),

    supabase.from('portal_offers')
      .select('portal_entry_id, nil_offer, status')
      .eq('league_id', leagueId)
      .eq('team_id', member.team_id),

    supabase.from('team_finances')
      .select('nil_bank, nil_committed_weekly, nil_weekly_cap')
      .eq('team_id', member.team_id)
      .single()
      .then(r => r.data),

    // My players who might be at risk
    supabase.from('players')
      .select('id, first_name, last_name, position, overall, morale, in_portal')
      .eq('team_id', member.team_id)
      .order('overall', { ascending: false }),
  ]);

  const myOfferMap = new Map((myOffers || []).map(o => [o.portal_entry_id, o]));

  return (
    <PortalBoard
      leagueId={leagueId}
      teamId={member.team_id}
      week={league?.current_week || 1}
      entries={entries || []}
      myOfferMap={myOfferMap}
      nilBank={finances?.nil_bank || 0}
      nilCap={finances?.nil_weekly_cap || 100000}
      nilCommitted={finances?.nil_committed_weekly || 0}
      myPlayers={myPlayers || []}
    />
  );
}
