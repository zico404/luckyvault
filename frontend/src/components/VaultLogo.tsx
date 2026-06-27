export function VaultLogo({ className = '', size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vault-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D060" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A08030" />
        </linearGradient>
        <linearGradient id="vault-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A2E1C" />
          <stop offset="100%" stopColor="#0A120B" />
        </linearGradient>
        <linearGradient id="vault-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE88A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8A7020" />
        </linearGradient>
        <radialGradient id="vault-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE88A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <filter id="vault-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="vault-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer circle - dark base */}
      <circle cx="60" cy="60" r="56" fill="url(#vault-dark)" filter="url(#vault-shadow)" />

      {/* Gold ring */}
      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#vault-ring)" strokeWidth="5" />

      {/* Inner ring detail */}
      <circle cx="60" cy="60" r="47" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.4" />

      {/* Tick marks - 12 positions */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const isCardinal = angle % 90 === 0
        const rad = (angle * Math.PI) / 180
        const inner = isCardinal ? 38 : 40
        const outer = 47
        return (
          <line
            key={angle}
            x1={60 + inner * Math.sin(rad)}
            y1={60 - inner * Math.cos(rad)}
            x2={60 + outer * Math.sin(rad)}
            y2={60 - outer * Math.cos(rad)}
            stroke={isCardinal ? '#FFE88A' : '#C9A84C'}
            strokeWidth={isCardinal ? 2.5 : 1.5}
            strokeLinecap="round"
            opacity={isCardinal ? 1 : 0.6}
          />
        )
      })}

      {/* Center glow */}
      <circle cx="60" cy="60" r="20" fill="url(#vault-center-glow)" />

      {/* Center knob outer */}
      <circle cx="60" cy="60" r="16" fill="none" stroke="#A08030" strokeWidth="1.5" />

      {/* Center knob */}
      <circle cx="60" cy="60" r="14" fill="url(#vault-gold)" />

      {/* Knob inner ring */}
      <circle cx="60" cy="60" r="10" fill="none" stroke="#A08030" strokeWidth="0.8" opacity="0.5" />

      {/* Center dot */}
      <circle cx="60" cy="60" r="4" fill="#0D1B0E" />

      {/* Handle bar */}
      <line
        x1="60" y1="46" x2="60" y2="74"
        stroke="#FFE88A"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#vault-glow)"
      />

      {/* Handle endpoints */}
      <circle cx="60" cy="46" r="2.5" fill="#FFE88A" />
      <circle cx="60" cy="74" r="2.5" fill="#FFE88A" />
    </svg>
  )
}
