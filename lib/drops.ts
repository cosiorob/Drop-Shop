import { createClient } from '@/lib/supabase-server'
import type { Drop, Category } from '@/types'

type StatusBadge = {
  label: string
  className: string
  pulse?: boolean
}

export function getDropStatusBadge(drop: Drop): StatusBadge {
  const now = new Date()
  const closesAt = new Date(drop.closes_at)
  const msRemaining = closesAt.getTime() - now.getTime()
  const hrRemaining = msRemaining / (1000 * 60 * 60)

  if (drop.status === 'completed' || drop.winner_id) {
    return { label: 'Ended', className: 'bg-gray-100 text-gray-500' }
  }
  if (drop.status === 'closed') {
    return { label: 'Closed', className: 'bg-gray-100 text-gray-500' }
  }
  if (drop.spots_claimed >= drop.total_spots) {
    return { label: 'Full', className: 'bg-yellow-100 text-yellow-700' }
  }
  if (msRemaining > 0 && hrRemaining < 1) {
    return { label: 'Ending Soon', className: 'bg-red-100 text-red-600', pulse: true }
  }
  if (msRemaining > 0 && hrRemaining <= 2) {
    return { label: 'Hot 🔥', className: 'bg-orange-100 text-orange-600' }
  }
  if (drop.status === 'active') {
    return { label: 'Active', className: 'bg-green-100 text-green-700' }
  }
  return { label: 'Draft', className: 'bg-gray-100 text-gray-600' }
}

export async function getActiveDrops(): Promise<Drop[]> {
  const supabase = createClient()

  const { data: drops, error: dropErr } = await supabase
    .from('drops')
    .select('*, store:stores(*), category:categories(*), drop_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (dropErr) throw new Error(`DB error (drops): ${dropErr.message}`)
  return drops ?? []
}

export async function getActiveDropsByCategory(): Promise<
  { category: Category; drops: Drop[] }[]
> {
  const supabase = createClient()

  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (catErr) throw new Error(`DB error (categories): ${catErr.message}`)
  if (!categories) return []

  const { data: drops, error: dropErr } = await supabase
    .from('drops')
    .select('*, store:stores(*), category:categories(*), drop_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (dropErr) throw new Error(`DB error (drops): ${dropErr.message}`)
  if (!drops) return []

  return categories
    .map((category) => ({
      category,
      drops: drops.filter((d) => d.category_id === category.id),
    }))
    .filter((c) => c.drops.length > 0)
}

export async function getDropById(id: string): Promise<Drop | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from('drops')
    .select('*, store:stores(*), category:categories(*), drop_images(*)')
    .eq('id', id)
    .single()

  return data
}

export async function getRetailerDrops(storeId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('drops')
    .select('*, category:categories(*), drop_images(*)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return data ?? []
}
