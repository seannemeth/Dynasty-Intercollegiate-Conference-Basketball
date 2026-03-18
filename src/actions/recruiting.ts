'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function allocateRecruitingPoints(leagueId: string, recruitId: string, points: number) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('rpc_recruiting_action', {
    p_league_id: leagueId,
    p_recruit_id: recruitId,
    p_action_type: 'allocate_points',
    p_points_spent: points,
    p_scholarship_offered: false,
  });

  if (error) return { error: error.message };
  revalidatePath(`/league/${leagueId}/recruiting`);
  return { success: true };
}

export async function offerScholarship(leagueId: string, recruitId: string, points: number) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('rpc_recruiting_action', {
    p_league_id: leagueId,
    p_recruit_id: recruitId,
    p_action_type: 'offer_scholarship',
    p_points_spent: points,
    p_scholarship_offered: true,
  });

  if (error) return { error: error.message };
  revalidatePath(`/league/${leagueId}/recruiting`);
  return { success: true };
}

export async function cancelRecruitingOffer(leagueId: string, recruitId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('rpc_recruiting_action', {
    p_league_id: leagueId,
    p_recruit_id: recruitId,
    p_action_type: 'cancel_offer',
    p_points_spent: 0,
    p_scholarship_offered: false,
  });

  if (error) return { error: error.message };
  revalidatePath(`/league/${leagueId}/recruiting`);
  return { success: true };
}

export async function makePortalOffer(leagueId: string, portalEntryId: string, nilOffer: number) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('rpc_portal_offer', {
    p_league_id: leagueId,
    p_portal_entry_id: portalEntryId,
    p_nil_offer: nilOffer,
    p_points_spent: 10,
  });

  if (error) return { error: error.message };
  revalidatePath(`/league/${leagueId}/portal`);
  return { success: true };
}
