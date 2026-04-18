import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'
import { getUserOrConsumer } from '@/lib/dev-auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const user = await getUserOrConsumer(authUser)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const spotsCount = Math.min(10, Math.max(1, parseInt(body.spotsCount ?? '1', 10) || 1))
  const selectedNumber = body.selectedNumber ? parseInt(body.selectedNumber, 10) : null

  const { data: drop } = await supabase.from('drops').select('*').eq('id', params.id).single()
  if (!drop) return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  if (drop.status !== 'active') return NextResponse.json({ error: 'Drop is not active' }, { status: 400 })

  const spotsLeft = drop.total_spots - drop.spots_claimed
  if (spotsLeft <= 0) return NextResponse.json({ error: 'No spots remaining' }, { status: 400 })
  if (spotsCount > spotsLeft) return NextResponse.json({ error: `Only ${spotsLeft} spot(s) left` }, { status: 400 })

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
        quantity: spotsCount,
      },
    ],
    customer_email: user.email ?? undefined,
    metadata: {
      drop_id: params.id,
      user_id: user.id,
      spots_count: String(spotsCount),
      selected_number: selectedNumber != null ? String(selectedNumber) : '',
    },
    success_url: `${origin}/drops/${params.id}?payment=success`,
    cancel_url: `${origin}/drops/${params.id}`,
  })

  return NextResponse.json({ url: session.url })
}
