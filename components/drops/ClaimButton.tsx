'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClaimButtonProps {
  dropId: string
  pricePerSpotCents: number
  spotsRemaining: number
  userHasEntered: boolean
  isAuthenticated?: boolean
}

export function ClaimButton({
  dropId,
  pricePerSpotCents,
  spotsRemaining,
  userHasEntered,
}: ClaimButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        ✓ You&apos;re In!
      </div>
    )
  }

  async function handleClaim() {
    setLoading(true)
    setError('')

    // Cookie-based auth is handled automatically by the server
    const res = await fetch(`/api/drops/${dropId}/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.status === 401) {
      router.push(`/login?redirect=/drops/${dropId}`)
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
    <div className="space-y-2">
      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-brand-gradient text-white font-bold text-base shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? 'Processing…' : `Claim Your Spot — $${(pricePerSpotCents / 100).toFixed(0)}`}
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  )
}
