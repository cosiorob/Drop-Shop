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

    if (!dropId || !userId) return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })

    // Check not already entered (idempotency)
    const { data: existing } = await getSupabaseAdmin()
      .from('entries')
      .select('id')
      .eq('drop_id', dropId)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      // Insert entry
      await getSupabaseAdmin().from('entries').insert({
        drop_id: dropId,
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent as string,
      })

      // Increment spots_claimed atomically
      const { data: drop } = await getSupabaseAdmin()
        .from('drops')
        .select('spots_claimed, total_spots, status')
        .eq('id', dropId)
        .single()

      if (drop) {
        const newClaimed = drop.spots_claimed + 1
        await getSupabaseAdmin()
          .from('drops')
          .update({ spots_claimed: newClaimed })
          .eq('id', dropId)

        // Auto-draw if full
        if (newClaimed >= drop.total_spots && drop.status === 'active') {
          await getSupabaseAdmin().from('drops').update({ status: 'closed' }).eq('id', dropId)
          await selectWinner(dropId)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
