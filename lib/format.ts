export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

export function formatCentsDecimal(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatSpots(claimed: number, total: number): string {
  return `${total - claimed} / ${total} spots left`
}

export function formatCountdown(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return 'Closed'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function spotsRemaining(claimed: number, total: number): number {
  return total - claimed
}

export function percentFilled(claimed: number, total: number): number {
  return Math.round((claimed / total) * 100)
}
