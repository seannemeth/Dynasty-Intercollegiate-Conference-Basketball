import { NextRequest, NextResponse } from 'next/server';
import { seedLeague } from '@/lib/game/seed-server';

export async function POST(req: NextRequest) {
  try {
    const { league_id } = await req.json();
    if (!league_id) return NextResponse.json({ error: 'league_id required' }, { status: 400 });

    // Verify internal call
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const result = await seedLeague(league_id);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
