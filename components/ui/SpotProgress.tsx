'use client'

import { percentFilled, spotsRemaining } from '@/lib/format'

interface SpotProgressProps {
  claimed: number
  total: number
  showLabel?: boolean
}

export function SpotProgress({ claimed, total, showLabel = true }: SpotProgressProps) {
  const pct = percentFilled(claimed, total)
  const remaining = spotsRemaining(claimed, total)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="font-medium text-periwinkle">{remaining} spots left</span>
          <span>{claimed} / {total}</span>
        </div>
      )}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gradient rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
