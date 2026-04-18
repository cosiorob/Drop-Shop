import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/drops/[id]/raffle — returns entries with spot numbers + display names
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data: drop, error: dropErr } = await admin()
    .from('drops')
    .select('id, title, total_spots, spots_claimed, status, winner_id')
    .eq('id', params.id)
    .single()
  if (dropErr || !drop) return NextResponse.json({ error: 'Drop not found' }, { status: 404 })

  const { data: entries } = await admin()
    .from('entries')
    .select('id, user_id, created_at')
    .eq('drop_id', params.id)
    .order('created_at', { ascending: true })

  const userIds = (entries ?? []).map((e) => e.user_id)
  const { data: profiles } = await admin()
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name]))

  const spots = (entries ?? []).map((entry, i) => ({
    spotNumber: i + 1,
    userId: entry.user_id,
    displayName: profileMap[entry.user_id] ?? 'Anonymous',
  }))

  return NextResponse.json({
    drop: {
      id: drop.id,
      title: drop.title,
      totalSpots: drop.total_spots,
      spotsClaimed: drop.spots_claimed,
      status: drop.status,
      winnerId: drop.winner_id,
    },
    spots,
  })
}

// POST /api/drops/[id]/raffle — draw a winner and persist to DB
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { data: drop, error: dropErr } = await admin()
    .from('drops')
    .select('id, winner_id')
    .eq('id', params.id)
    .single()
  if (dropErr || !drop) return NextResponse.json({ error: 'Drop not found' }, { status: 404 })

  if (drop.winner_id) {
    // Winner already drawn — return existing winner info
    const { data: profile } = await admin()
      .from('profiles')
      .select('display_name')
      .eq('id', drop.winner_id)
      .single()

    const { data: entries } = await admin()
      .from('entries')
      .select('user_id')
      .eq('drop_id', params.id)
      .order('created_at', { ascending: true })

    const winnerIndex = (entries ?? []).findIndex((e) => e.user_id === drop.winner_id)

    return NextResponse.json({
      winnerId: drop.winner_id,
      winnerName: profile?.display_name ?? 'Anonymous',
      winnerIndex: winnerIndex >= 0 ? winnerIndex : 0,
      alreadyDrawn: true,
    })
  }

  const { data: entries } = await admin()
    .from('entries')
    .select('user_id')
    .eq('drop_id', params.id)
    .order('created_at', { ascending: true })

  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: 'No entries yet' }, { status: 400 })
  }

  const winnerIndex = Math.floor(Math.random() * entries.length)
  const winnerId = entries[winnerIndex].user_id

  await admin()
    .from('drops')
    .update({ winner_id: winnerId, status: 'completed' })
    .eq('id', params.id)

  await admin().from('notifications').insert({
    user_id: winnerId,
    type: 'win',
    drop_id: params.id,
  })

  const { data: profile } = await admin()
    .from('profiles')
    .select('display_name')
    .eq('id', winnerId)
    .single()

  return NextResponse.json({
    winnerId,
    winnerName: profile?.display_name ?? 'Anonymous',
    winnerIndex,
    alreadyDrawn: false,
  })
}
