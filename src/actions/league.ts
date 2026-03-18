'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function createLeague(formData: FormData) {
  const supabase = await createClient() as AnySupabase;
  const name = formData.get('name') as string;
  const advanceMode = (formData.get('advance_mode') as string) || 'manual';

  if (!name?.trim()) return { error: 'League name required' };

  const { data, error } = await supabase.rpc('rpc_create_league', {
    p_name: name.trim(),
    p_advance_mode: advanceMode,
  });

  if (error) return { error: error.message };

  const leagueId = data?.league_id;

  // Trigger seeding via edge function
  const seedRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/seed-league`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ league_id: leagueId }),
  });

  if (!seedRes.ok) {
    const err = await seedRes.text();
    console.error('Seed failed:', err);
    return { error: 'League created but seeding failed. Contact support.' };
  }

  redirect(`/league/${leagueId}`);
}

export async function joinLeague(formData: FormData) {
  const supabase = await createClient() as AnySupabase;
  const inviteCode = formData.get('invite_code') as string;

  if (!inviteCode?.trim()) return { error: 'Invite code required' };

  const { data, error } = await supabase.rpc('rpc_join_league', {
    p_invite_code: inviteCode.trim().toUpperCase(),
  });

  if (error) return { error: error.message };

  const leagueId = data?.league_id;
  redirect(`/league/${leagueId}`);
}

export async function claimTeam(leagueId: string, teamId: string) {
  const supabase = await createClient() as AnySupabase;

  const { error } = await supabase.rpc('rpc_claim_team', {
    p_league_id: leagueId,
    p_team_id: teamId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/league/${leagueId}`);
  return { success: true };
}

export async function markReady(leagueId: string) {
  const supabase = await createClient() as AnySupabase;

  const { error } = await supabase.rpc('rpc_mark_ready', {
    p_league_id: leagueId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/league/${leagueId}`);
  return { success: true };
}

export async function advanceWeek(leagueId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { error: 'Not authenticated' };

  // Verify commissioner
  const { data: member } = await supabase
    .from('league_members')
    .select('role')
    .eq('league_id', leagueId)
    .eq('user_id', session.user.id)
    .single() as { data: { role: string } | null; error: unknown };

  if (!member || !['commissioner', 'co_commish'].includes(member.role)) {
    return { error: 'Not authorized' };
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-week`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ league_id: leagueId }),
  });

  const result = await res.json();
  if (!res.ok) return { error: result.error || 'Advance failed' };

  revalidatePath(`/league/${leagueId}`);
  return { success: true, ...result };
}

export async function submitAdDecision(leagueId: string, choiceKey: string, choiceLabel: string) {
  const supabase = await createClient() as AnySupabase;

  const { data, error } = await supabase.rpc('rpc_ad_decision', {
    p_league_id: leagueId,
    p_choice_key: choiceKey,
    p_choice_label: choiceLabel,
  });

  if (error) return { error: error.message };

  revalidatePath(`/league/${leagueId}/nil-ad`);
  return { success: true, effect: data?.effect };
}
