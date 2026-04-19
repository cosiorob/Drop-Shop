import { getActiveDrops } from '@/lib/drops'
import { createClient } from '@/lib/supabase-server'
import { DropCard } from '@/components/drops/DropCard'
import { CategoryFilter } from '@/components/drops/CategoryFilter'
import type { Category } from '@/types'

export default async function FeedPage({ searchParams }: { searchParams: { category?: string } }) {
  const selectedCategory = searchParams.category ?? null

  const supabase = createClient()
  let drops: Awaited<ReturnType<typeof getActiveDrops>> = []
  let categories: Category[] = []
  let dbError: string | null = null

  try {
    const [allDrops, catRes] = await Promise.all([
      getActiveDrops(),
      supabase.from('categories').select('*').order('name'),
    ])
    drops = selectedCategory
      ? allDrops.filter((d) => d.category?.slug === selectedCategory)
      : allDrops
    categories = catRes.data ?? []
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Unknown database error'
  }

  return (
    <div className="pt-4">
      {/* Search bar */}
      <div className="px-4 mb-4">
        <a href="/search" className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3 text-gray-400 text-sm">
          🔍 Search drops…
        </a>
      </div>

      {/* Category filter chips */}
      {!dbError && categories.length > 0 && (
        <div className="mb-4">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} />
        </div>
      )}

      {/* Content */}
      {dbError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-600 mb-2">Database not set up</h3>
          <p className="text-gray-500 text-sm mb-1">{dbError}</p>
          <p className="text-gray-400 text-xs">Run the schema SQL in Supabase, then visit <code>/api/seed?secret=dropshop-seed</code></p>
        </div>
      ) : drops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {selectedCategory ? 'No drops in this category' : 'No drops yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {selectedCategory ? 'Try another category or check back soon.' : 'Check back soon — new drops are on the way!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-8">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  )
}
