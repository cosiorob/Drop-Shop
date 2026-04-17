import { getActiveDropsByCategory } from '@/lib/drops'
import { CategoryRow } from '@/components/drops/CategoryRow'
import type { Category, Drop } from '@/types'

export const revalidate = 30

export default async function FeedPage() {
  let sections: { category: Category; drops: Drop[] }[] = []
  let dbError: string | null = null

  try {
    sections = await getActiveDropsByCategory()
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Unknown database error'
  }

  return (
    <div className="pt-4">
      <div className="px-4 mb-6">
        <a href="/search" className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3 text-gray-400 text-sm">
          🔍 Search drops…
        </a>
      </div>

      {dbError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-600 mb-2">Database not set up</h3>
          <p className="text-gray-500 text-sm mb-1">{dbError}</p>
          <p className="text-gray-400 text-xs">Run the schema SQL in Supabase, then visit <code>/api/seed?secret=dropshop-seed</code></p>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No drops yet</h3>
          <p className="text-gray-500 text-sm">Check back soon — new drops are on the way!</p>
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {sections.map(({ category, drops }) => (
            <CategoryRow key={category.id} category={category} drops={drops} />
          ))}
        </div>
      )}
    </div>
  )
}
