import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { selectWinner } from '@/lib/winner'
import type Stripe from 'stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const dropId = session.metadata?.drop_id
    const userId = session.metadata?.user_id
    const spotsCount = parseInt(session.metadata?.spots_count ?? '1', 10) || 1
    const selectedNumber = session.metadata?.selected_number
      ? parseInt(session.metadata.selected_number, 10)
      : null

    if (!dropId || !userId) return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })

    // Idempotency: skip if this payment intent already created an entry
    const { data: existing } = await getSupabaseAdmin()
      .from('entries')
      .select('id')
      .eq('stripe_payment_intent_id', session.payment_intent as string)
      .maybeSingle()

    if (!existing) {
      await getSupabaseAdmin().from('entries').insert({
        drop_id: dropId,
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent as string,
        spots_count: spotsCount,
        selected_number: selectedNumber,
      })

      const { data: drop } = await getSupabaseAdmin()
        .from('drops')
        .select('spots_claimed, total_spots, status')
        .eq('id', dropId)
        .single()

      if (drop) {
        const newClaimed = drop.spots_claimed + spotsCount
        await getSupabaseAdmin()
          .from('drops')
          .update({ spots_claimed: newClaimed })
          .eq('id', dropId)

        if (newClaimed >= drop.total_spots && drop.status === 'active') {
          await getSupabaseAdmin().from('drops').update({ status: 'closed' }).eq('id', dropId)
          await selectWinner(dropId)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
