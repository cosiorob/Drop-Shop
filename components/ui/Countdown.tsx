'use client'

import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/format'

export function Countdown({ closesAt }: { closesAt: string }) {
  const [display, setDisplay] = useState(formatCountdown(closesAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(formatCountdown(closesAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [closesAt])

  const isClosed = display === 'Closed'

  return (
    <span className={`font-mono font-semibold ${isClosed ? 'text-red-500' : 'text-periwinkle'}`}>
      {display}
    </span>
  )
}
