import { createClient } from '@/lib/supabase-server'
import type { Drop, Category } from '@/types'

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
