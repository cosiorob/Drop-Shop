import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function seedUser(email: string) {
  const { data } = await admin().auth.admin.listUsers({ perPage: 100 })
  return data?.users?.find((u) => u.email === email) ?? null
}

// Returns the authenticated user, or falls back to the seed consumer
export async function getUserOrConsumer(authUser: unknown) {
  if (authUser) return authUser as { id: string; email?: string }
  return seedUser('shopper@dropshop.test') as Promise<{ id: string; email?: string } | null>
}

// Returns the authenticated user, or falls back to the seed retailer
export async function getUserOrRetailer(authUser: unknown) {
  if (authUser) return authUser as { id: string; email?: string }
  return seedUser('retailer@dropshop.test') as Promise<{ id: string; email?: string } | null>
}

// Returns the store for a user, or the first store in the DB
export async function getStoreOrFirst(userId: string) {
  const a = admin()
  const { data } = await a.from('stores').select('*').eq('owner_id', userId).single()
  if (data) return data
  const { data: first } = await a.from('stores').select('*').limit(1).single()
  return first
}
