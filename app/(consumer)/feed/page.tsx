import { getActiveDropsByCategory } from '@/lib/drops'
import { CategoryRow } from '@/components/drops/CategoryRow'

export const revalidate = 30

export default async function FeedPage() {
  const sections = await getActiveDropsByCategory()

  return (
    <div className="pt-4">
      {/* Search bar hint */}
      <div className="px-4 mb-6">
        <a href="/search" className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3 text-gray-400 text-sm">
          🔍 Search drops…
        </a>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No drops yet</h3>
          <p className="text-gray-500 text-sm">Check back soon — new drops are on the way!</p>
        </div>
      ) : (
        sections.map(({ category, drops }) => (
          <CategoryRow key={category.id} category={category} drops={drops} />
        ))
      )}
    </div>
  )
}
