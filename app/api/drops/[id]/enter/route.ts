import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch drop
  const { data: drop } = await supabase.from('drops').select('*').eq('id', params.id).single()
  if (!drop) return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  if (drop.status !== 'active') return NextResponse.json({ error: 'Drop is not active' }, { status: 400 })
  if (drop.spots_claimed >= drop.total_spots) return NextResponse.json({ error: 'No spots remaining' }, { status: 400 })

  // Check already entered
  const { data: existing } = await supabase.from('entries').select('id').eq('drop_id', params.id).eq('user_id', user.id).single()
  if (existing) return NextResponse.json({ error: 'Already entered' }, { status: 400 })

  // Create Stripe Checkout Session
  const origin = request.headers.get('origin') ?? 'http://localhost:3000'
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: drop.price_per_spot_cents,
          product_data: {
            name: `Spot in: ${drop.title}`,
            description: `DROPSHOP raffle entry — ${drop.total_spots} total spots`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: user.email ?? undefined,
    metadata: {
      drop_id: params.id,
      user_id: user.id,
    },
    success_url: `${origin}/drops/${params.id}?payment=success`,
    cancel_url: `${origin}/drops/${params.id}`,
  })

  return NextResponse.json({ url: session.url })
}
