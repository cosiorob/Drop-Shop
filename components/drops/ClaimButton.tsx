'use client'

import { useState } from 'react'
import { EntryModal } from './EntryModal'
import type { Drop, Store } from '@/types'

interface ClaimButtonProps {
  drop: Drop & { store: Store }
  userHasEntered: boolean
}

export function ClaimButton({ drop, userHasEntered }: ClaimButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const spotsRemaining = drop.total_spots - drop.spots_claimed

  if (spotsRemaining === 0) {
    return (
      <div className="w-full py-4 text-center rounded-2xl bg-gray-100 text-gray-500 font-semibold">
        Drop Closed
      </div>
    )
  }

  if (userHasEntered) {
    return (
      <div className="w-full py-4 text-center rounded-2xl bg-green-50 text-green-700 font-semibold border-2 border-green-200">
        ✓ You&apos;re In! <span className="font-normal text-sm">(Enter again for more spots)</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full py-4 rounded-2xl bg-brand-gradient text-white font-bold text-base shadow-md hover:opacity-90 transition-opacity"
      >
        Claim Your Spot — ${(drop.price_per_spot_cents / 100).toFixed(0)}
      </button>

      <EntryModal
        drop={drop}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
