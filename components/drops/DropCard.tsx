import Link from 'next/link'
import { formatCents } from '@/lib/format'
import { getDropStatusBadge } from '@/lib/drops'
import type { Drop } from '@/types'

export function DropCard({ drop }: { drop: Drop }) {
  const imageUrl = drop.drop_images?.[0]?.url ?? null
  const spotsLeft = drop.total_spots - drop.spots_claimed
  const fillPct = Math.round((drop.spots_claimed / drop.total_spots) * 100)
  const badge = getDropStatusBadge(drop)

  return (
    <Link href={`/drops/${drop.id}`} className="group block">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={drop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
        )}

        {/* Status badge */}
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${badge.className} ${badge.pulse ? 'animate-pulse-slow' : ''}`}>
          {badge.label}
        </div>

        {spotsLeft <= 2 && spotsLeft > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {spotsLeft} left!
          </div>
        )}
      </div>

      {/* Spots progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-1.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <p className="text-xs font-semibold text-periwinkle">{formatCents(drop.price_per_spot_cents)} / {drop.total_spots} spots</p>
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{drop.title}</p>
      {drop.store && (
        <p className="text-xs text-gray-400 truncate">{drop.store.name}</p>
      )}
    </Link>
  )
}
