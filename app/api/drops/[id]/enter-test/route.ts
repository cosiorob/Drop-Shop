import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Bypasses Stripe — for seeding test entries only
// Requires ?secret=dropshop-seed in the URL
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== 'dropshop-seed') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const userId: string | undefined = body.user_id

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: drop } = await supabase
    .from('drops')
    .select('id, status, total_spots, spots_claimed')
    .eq('id', params.id)
    .single()

  if (!drop) return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  if (drop.spots_claimed >= drop.total_spots) {
    return NextResponse.json({ error: 'No spots remaining' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('entries')
    .select('id')
    .eq('drop_id', params.id)
    .eq('user_id', userId)
    .single()

  if (existing) return NextResponse.json({ error: 'Already entered' }, { status: 400 })

  const { error: insertErr } = await supabase.from('entries').insert({
    drop_id: params.id,
    user_id: userId,
    stripe_payment_intent_id: `test_${Date.now()}`,
  })

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  const newClaimed = drop.spots_claimed + 1
  await supabase.from('drops').update({ spots_claimed: newClaimed }).eq('id', params.id)

  return NextResponse.json({ success: true, spots_claimed: newClaimed })
}
