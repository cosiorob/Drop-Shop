'use client'

import { useState, useRef } from 'react'

interface Spot {
  spotNumber: number
  userId: string
  displayName: string
}

interface SpinningWheelProps {
  dropId: string
  totalSpots: number
  spots: Spot[]
  existingWinnerId?: string | null
}

const SEGMENT_COLORS = [
  '#6B7AFF', '#9B6BFF', '#FF6BA8', '#FF8C6B',
  '#FFD56B', '#6BFFC8', '#6BC5FF', '#D46BFF',
  '#FF6B6B', '#6BFFA8',
]

const UNCLAIMED_COLOR = '#E5E7EB'

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function buildPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = toRad(startDeg - 90)
  const end = toRad(endDeg - 90)
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

export function SpinningWheel({ dropId, totalSpots, spots, existingWinnerId }: SpinningWheelProps) {
  const SIZE = 300
  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = SIZE / 2 - 8

  const claimedSet = new Set(spots.map((s) => s.spotNumber))
  const segmentAngle = 360 / totalSpots

  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<{ index: number; name: string; id: string } | null>(null)
  const [revealed, setRevealed] = useState(!!existingWinnerId)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // If there's already a winner, pre-populate
  const existingWinnerSpot = existingWinnerId
    ? spots.findIndex((s) => s.userId === existingWinnerId)
    : -1

  async function handleSpin() {
    if (spinning || revealed) return
    setSpinning(true)
    setError('')

    try {
      const res = await fetch(`/api/drops/${dropId}/raffle`, { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Draw failed')
        setSpinning(false)
        return
      }

      const { winnerIndex, winnerName, winnerId } = json

      // Land the winning segment (0-indexed) at the top pointer
      // Segment i center is at: (i + 0.5) * segmentAngle degrees from top
      const winOffset = (winnerIndex + 0.5) * segmentAngle
      // Spin 8 full rotations + land on winner
      const baseRotations = Math.ceil(rotation / 360) * 360
      const newRotation = baseRotations + 8 * 360 + winOffset

      setRotation(newRotation)

      timerRef.current = setTimeout(() => {
        setWinner({ index: winnerIndex, name: winnerName, id: winnerId })
        setRevealed(true)
        setSpinning(false)
      }, 5500)
    } catch {
      setError('Network error')
      setSpinning(false)
    }
  }

  const winnerSpotIndex = winner?.index ?? existingWinnerSpot

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel + pointer */}
      <div className="relative" style={{ width: SIZE + 16, height: SIZE + 32 }}>
        {/* Pointer arrow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10"
          style={{ top: 0, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '24px solid #1F2937' }}
        />

        {/* Wheel */}
        <div
          className="absolute"
          style={{
            top: 24,
            left: 8,
            width: SIZE,
            height: SIZE,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {Array.from({ length: totalSpots }, (_, i) => {
              const startDeg = i * segmentAngle
              const endDeg = (i + 1) * segmentAngle
              const midDeg = startDeg + segmentAngle / 2
              const midRad = toRad(midDeg - 90)
              const textR = r * 0.65
              const tx = cx + textR * Math.cos(midRad)
              const ty = cy + textR * Math.sin(midRad)
              const isClaimed = claimedSet.has(i + 1)
              const isWinner = revealed && winnerSpotIndex === i
              const fill = isWinner
                ? '#FFD700'
                : isClaimed
                  ? SEGMENT_COLORS[i % SEGMENT_COLORS.length]
                  : UNCLAIMED_COLOR
              const textColor = isClaimed || isWinner ? 'white' : '#9CA3AF'
              const fontSize = totalSpots > 12 ? 10 : totalSpots > 8 ? 12 : 14

              return (
                <g key={i}>
                  <path
                    d={buildPath(cx, cy, r, startDeg, endDeg)}
                    fill={fill}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textColor}
                    fontSize={fontSize}
                    fontWeight="bold"
                    transform={`rotate(${midDeg}, ${tx}, ${ty})`}
                  >
                    {i + 1}
                  </text>
                </g>
              )
            })}
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={28} fill="white" stroke="#E5E7EB" strokeWidth="2" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight="bold" fill="#6B7280">
              DRAW
            </text>
          </svg>
        </div>
      </div>

      {/* Winner card */}
      {revealed && (winner || existingWinnerId) && (
        <div className="w-full max-w-xs bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-5 text-center shadow-lg animate-bounce-once">
          <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Winner!</p>
          <p className="text-white text-2xl font-black">
            {winner?.name ?? spots.find((s) => s.userId === existingWinnerId)?.displayName ?? 'Anonymous'}
          </p>
          <p className="text-yellow-100 text-sm mt-1">Spot #{(winnerSpotIndex ?? 0) + 1}</p>
        </div>
      )}

      {/* Spin button */}
      {!revealed && (
        <button
          onClick={handleSpin}
          disabled={spinning || spots.length === 0}
          className="px-10 py-4 rounded-2xl bg-brand-gradient text-white font-black text-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {spinning ? 'Spinning…' : spots.length === 0 ? 'No Entries Yet' : 'SPIN TO DRAW!'}
        </button>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Entry list */}
      <div className="w-full max-w-xs">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Entries ({spots.length} / {totalSpots} spots)
        </p>
        {spots.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No entries yet</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {spots.map((s) => (
              <div
                key={s.spotNumber}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                  revealed && winnerSpotIndex === s.spotNumber - 1
                    ? 'bg-yellow-50 border border-yellow-300 font-semibold'
                    : 'bg-gray-50'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-none"
                  style={{ background: SEGMENT_COLORS[(s.spotNumber - 1) % SEGMENT_COLORS.length] }}
                >
                  {s.spotNumber}
                </span>
                <span className="text-gray-700">{s.displayName}</span>
                {revealed && winnerSpotIndex === s.spotNumber - 1 && (
                  <span className="ml-auto text-yellow-600 text-xs font-bold">WINNER</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
