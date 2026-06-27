export function VaultMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const r = (s / 2) * 0.88

  // Octagon vertices
  const vertices = Array.from({ length: 8 }, (_, i) => {
    const angle = ((i * 45 - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const octagonPath = vertices.map((v, i) => `${i === 0 ? 'M' : 'L'}${v.x},${v.y}`).join(' ') + ' Z'

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Octagon shell */}
      <path
        d={octagonPath}
        stroke="#C9A962"
        strokeWidth={s * 0.035}
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner facets */}
      {vertices.map((v, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={v.x}
          y2={v.y}
          stroke="#C9A962"
          strokeWidth={s * 0.008}
          opacity={0.15}
        />
      ))}

      {/* Center diamond */}
      <polygon
        points={`${cx},${cy - r * 0.16} ${cx + r * 0.16},${cy} ${cx},${cy + r * 0.16} ${cx - r * 0.16},${cy}`}
        fill="#C9A962"
      />

      {/* Inner ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.44}
        stroke="#C9A962"
        strokeWidth={s * 0.007}
        fill="none"
        opacity={0.2}
      />
    </svg>
  )
}
