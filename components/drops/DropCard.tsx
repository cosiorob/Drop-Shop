import Image from 'next/image'
import Link from 'next/link'
import { formatCents, spotsRemaining } from '@/lib/format'
import type { Drop } from '@/types'

export function DropCard({ drop }: { drop: Drop }) {
  const imageUrl = drop.drop_images?.[0]?.url ?? null
  const remaining = spotsRemaining(drop.spots_claimed, drop.total_spots)

  return (
    <Link href={`/drops/${drop.id}`} className="flex-none w-40 group">
      <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 mb-2">
        {imageUrl ? (
          <Image src={imageUrl} alt={drop.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
        )}
        {remaining <= 2 && remaining > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {remaining} left!
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-periwinkle">{formatCents(drop.price_per_spot_cents)} / {drop.total_spots} spots</p>
      <p className="text-sm font-medium text-gray-900 truncate">{drop.title}</p>
      {drop.store && (
        <p className="text-xs text-gray-400 truncate">{drop.store.name}</p>
      )}
    </Link>
  )
}
