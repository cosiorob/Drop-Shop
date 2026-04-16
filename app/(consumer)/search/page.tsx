import { createClient } from '@/lib/supabase-server'
import { DropCard } from '@/components/drops/DropCard'
import type { Drop } from '@/types'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; maxPrice?: string; maxSpots?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('drops')
    .select('*, store:stores(*), category:categories(*), drop_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', searchParams.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (searchParams.maxPrice) {
    query = query.lte('price_per_spot_cents', parseInt(searchParams.maxPrice) * 100)
  }
  if (searchParams.maxSpots) {
    query = query.lte('total_spots', parseInt(searchParams.maxSpots))
  }

  const { data: drops } = await query
  const results: Drop[] = drops ?? []

  return (
    <div className="px-4 pt-4">
      <form method="GET" className="mb-6">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search drops…"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-periwinkle"
        />
      </form>

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">No drops found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {results.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  )
}
