'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  function select(slug: string | null) {
    router.push(slug ? `${pathname}?category=${slug}` : pathname)
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
      <button
        onClick={() => select(null)}
        className={`flex-none px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
          !selectedCategory
            ? 'bg-brand-gradient text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`flex-none px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === cat.slug
              ? 'bg-brand-gradient text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  )
}
