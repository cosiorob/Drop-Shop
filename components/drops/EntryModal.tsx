'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SpinningWheelPreview } from './SpinningWheelPreview'
import type { Drop, Store } from '@/types'

interface EntryModalProps {
  drop: Drop & { store: Store }
  open: boolean
  onClose: () => void
}

export function EntryModal({ drop, open, onClose }: EntryModalProps) {
  const router = useRouter()
  const [spotsCount, setSpotsCount] = useState(1)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const spotsLeft = drop.total_spots - drop.spots_claimed
  const maxSpots = Math.min(10, spotsLeft)
  const pricePerSpot = drop.price_per_spot_cents / 100
  const retailValue = drop.retail_value_cents / 100
  const totalCost = spotsCount * pricePerSpot
  const savings = retailValue - pricePerSpot
  const savingsPct = Math.round((savings / retailValue) * 100)

  function handleSpotsDown() {
    setSpotsCount((n) => Math.max(1, n - 1))
    setSelectedNumber(null)
  }

  function handleSpotsUp() {
    setSpotsCount((n) => Math.min(maxSpots, n + 1))
    setSelectedNumber(null)
  }

  async function handleConfirm() {
    if (!selectedNumber) {
      setError('Pick your lucky number first')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/drops/${drop.id}/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotsCount, selectedNumber }),
    })

    if (res.status === 401) {
      router.push(`/login?redirect=/drops/${drop.id}`)
      return
    }

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    if (json.url) {
      window.location.href = json.url
    } else {
      setError('No checkout URL returned')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-w-lg mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header — gradient strip */}
        <div className="gradient-bg px-6 py-5 flex items-center gap-4 rounded-t-3xl">
          <SpinningWheelPreview
            size={100}
            selectedNumber={selectedNumber ?? undefined}
            isSpinning={!selectedNumber}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{drop.store.name}</p>
            <p className="text-white font-bold text-base leading-snug line-clamp-2">{drop.title}</p>
            <p className="text-white/90 text-sm mt-1">
              <span className="font-bold">${pricePerSpot.toFixed(0)}</span>
              <span className="text-white/60"> / spot · </span>
              <span className="line-through text-white/60">${retailValue.toLocaleString()}</span>
              <span className="ml-1 text-white font-semibold">Save {savingsPct}%</span>
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none flex-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Spot count selector */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">How many spots?</p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSpotsDown}
                disabled={spotsCount <= 1}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-lg hover:border-periwinkle hover:text-periwinkle disabled:opacity-40 transition-colors"
              >
                −
              </button>
              <span className="text-2xl font-black text-gray-900 w-8 text-center">{spotsCount}</span>
              <button
                onClick={handleSpotsUp}
                disabled={spotsCount >= maxSpots}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-lg hover:border-periwinkle hover:text-periwinkle disabled:opacity-40 transition-colors"
              >
                +
              </button>
              <span className="text-xs text-gray-400 ml-1">{spotsLeft} spots left</span>
            </div>
          </div>

          {/* Lucky number picker */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Pick your lucky number
              {selectedNumber && (
                <span className="ml-2 text-periwinkle">#{selectedNumber} selected ✓</span>
              )}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNumber(n === selectedNumber ? null : n)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedNumber === n
                      ? 'bg-brand-gradient text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{spotsCount} spot{spotsCount > 1 ? 's' : ''} × ${pricePerSpot.toFixed(0)}</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>vs retail value</span>
              <span>Save ${(savings).toFixed(0)} ({savingsPct}%)</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={loading || !selectedNumber}
            className="w-full py-4 rounded-2xl btn-gradient font-bold text-base shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing…' : `Confirm — $${totalCost.toFixed(2)}`}
          </button>

          <p className="text-center text-xs text-gray-400 pb-2">
            Secure checkout via Stripe · Lucky number is for fun only
          </p>
        </div>
      </div>
    </>
  )
}
