'use client'

interface SpinningWheelPreviewProps {
  size?: number
  selectedNumber?: number
  isSpinning?: boolean
  className?: string
}

const SEGMENT_COLORS = [
  '#6EE7C7', // mint
  '#8B9FFF', // periwinkle
  '#A78BFA', // violet
  '#60A5FA', // blue
  '#34D399', // emerald
  '#F472B6', // pink
  '#FBBF24', // amber
  '#F87171', // red
  '#A3E635', // lime
  '#2DD4BF', // teal
]

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function SpinningWheelPreview({
  size = 200,
  selectedNumber,
  isSpinning = false,
  className = '',
}: SpinningWheelPreviewProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  const segmentAngle = 360 / 10
  const pointerSize = Math.max(8, size * 0.04)

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Pointer arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${pointerSize}px solid transparent`,
          borderRight: `${pointerSize}px solid transparent`,
          borderTop: `${pointerSize * 2}px solid #1F2937`,
          marginBottom: 2,
        }}
      />

      {/* Wheel */}
      <div
        style={isSpinning ? { animation: 'spin 3s linear infinite' } : undefined}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {Array.from({ length: 10 }, (_, i) => {
            const num = i + 1
            const startDeg = i * segmentAngle
            const endDeg = (i + 1) * segmentAngle
            const midDeg = startDeg + segmentAngle / 2
            const midRad = toRad(midDeg - 90)
            const textR = r * 0.65

            const startRad = toRad(startDeg - 90)
            const endRad = toRad(endDeg - 90)
            const x1 = cx + r * Math.cos(startRad)
            const y1 = cy + r * Math.sin(startRad)
            const x2 = cx + r * Math.cos(endRad)
            const y2 = cy + r * Math.sin(endRad)
            const tx = cx + textR * Math.cos(midRad)
            const ty = cy + textR * Math.sin(midRad)

            const isSelected = selectedNumber === num
            const fill = isSelected ? '#FFD700' : SEGMENT_COLORS[i]
            const fontSize = size < 120 ? 8 : size < 160 ? 10 : 12

            return (
              <g key={i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                  fill={fill}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight="bold"
                  transform={`rotate(${midDeg}, ${tx}, ${ty})`}
                >
                  {num}
                </text>
              </g>
            )
          })}

          {/* Center circle */}
          <circle cx={cx} cy={cy} r={size * 0.12} fill="white" stroke="#E5E7EB" strokeWidth="2" />
          {selectedNumber && !isSpinning ? (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.08}
              fontWeight="bold"
              fill="#6B7280"
            >
              #{selectedNumber}
            </text>
          ) : (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.05}
              fontWeight="bold"
              fill="#9CA3AF"
            >
              SPIN
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}
