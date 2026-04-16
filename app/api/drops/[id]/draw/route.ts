import { NextResponse } from 'next/server'
import { selectWinner } from '@/lib/winner'

// Called by Stripe webhook or manually (e.g., admin/cron)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Simple shared secret auth
  const authHeader = request.headers.get('authorization')
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const winnerId = await selectWinner(params.id)
  if (!winnerId) {
    return NextResponse.json({ error: 'No entries or draw failed' }, { status: 400 })
  }

  return NextResponse.json({ winnerId })
}
