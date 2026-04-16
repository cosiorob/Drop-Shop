import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const results: Record<string, unknown> = {}

  // Check env vars
  results.env = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing Supabase env vars', results })
  }

  // Try anon client (what the feed uses)
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const tables = ['categories', 'drops', 'drop_images', 'stores', 'profiles', 'entries']
  results.tables = {}

  for (const table of tables) {
    const { error, count } = await anon
      .from(table)
      .select('*', { count: 'exact', head: false })
      .limit(1)

    ;(results.tables as Record<string, unknown>)[table] = error
      ? { error: error.message, code: error.code }
      : { ok: true, count }
  }

  // Try service role if available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { data: drops, error } = await admin.from('drops').select('id, title, status').limit(5)
    results.admin_drops = error ? { error: error.message } : drops
  }

  return NextResponse.json(results, { status: 200 })
}
