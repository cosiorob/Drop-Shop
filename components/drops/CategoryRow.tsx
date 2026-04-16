import Link from 'next/link'
import { DropCard } from './DropCard'
import type { Drop, Category } from '@/types'

interface CategoryRowProps {
  category: Category
  drops: Drop[]
}

export function CategoryRow({ category, drops }: CategoryRowProps) {
  if (drops.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold text-gray-900">
          {category.icon && <span className="mr-1">{category.icon}</span>}
          {category.name}
        </h2>
        <Link
          href={`/search?category=${category.slug}`}
          className="text-sm text-periwinkle font-medium"
        >
          See all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {drops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </section>
  )
}
