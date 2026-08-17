export function ColiseumBackdrop() {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div className="coliseum-backdrop" aria-hidden>
      <div className="coliseum-vignette" />
      <svg className="coliseum-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="arena-glow" cx="50%" cy="42%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 224, 130, 0.55)" />
            <stop offset="35%" stopColor="rgba(245, 183, 46, 0.22)" />
            <stop offset="100%" stopColor="rgba(12, 13, 16, 0)" />
          </radialGradient>
          <radialGradient id="core-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="100%" stopColor="#f5b72e" />
          </radialGradient>
          <linearGradient id="ring-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5a6068" />
            <stop offset="45%" stopColor="#343840" />
            <stop offset="100%" stopColor="#1e2126" />
          </linearGradient>
          <linearGradient id="beam-gold" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="rgba(245, 183, 46, 0.75)" />
            <stop offset="100%" stopColor="rgba(245, 183, 46, 0)" />
          </linearGradient>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="blue-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill="#0c0d10" />
        <ellipse cx="720" cy="400" rx="720" ry="460" fill="url(#arena-glow)" />

        {/* Outer coliseum tiers */}
        {[680, 620, 560, 500].map((rx, i) => (
          <ellipse
            key={rx}
            cx="720"
            cy="400"
            rx={rx}
            ry={rx * 0.55}
            fill="none"
            stroke="#3a3f48"
            strokeWidth={3 - i * 0.4}
            opacity={0.9 - i * 0.12}
          />
        ))}

        {/* Radial spokes */}
        {spokes.map((deg) => (
          <line
            key={deg}
            x1="720"
            y1="400"
            x2={720 + Math.cos((deg * Math.PI) / 180) * 680}
            y2={400 + Math.sin((deg * Math.PI) / 180) * 374}
            stroke="#2e333b"
            strokeWidth="1"
            opacity="0.65"
          />
        ))}

        {/* Inner track rings */}
        {[440, 380, 320, 260, 200, 140].map((rx, i) => (
          <ellipse
            key={rx}
            cx="720"
            cy="400"
            rx={rx}
            ry={rx * 0.55}
            fill="none"
            stroke="url(#ring-metal)"
            strokeWidth={2.2 - i * 0.15}
            opacity={0.9 - i * 0.08}
          />
        ))}

        {/* Center light beam */}
        <rect x="714" y="60" width="12" height="540" fill="url(#beam-gold)" opacity="0.85" />
        <ellipse cx="720" cy="400" rx="56" ry="56" fill="url(#core-gold)" filter="url(#gold-glow)" opacity="0.95" />
        <ellipse cx="720" cy="400" rx="28" ry="28" fill="#fff8e1" opacity="0.5" />

        {/* Medal tokens */}
        <g filter="url(#gold-glow)">
          <circle cx="720" cy="145" r="38" fill="#1a1d21" stroke="#f5b72e" strokeWidth="4" />
          <path
            d="M720 128c-6 8-10 14-10 20 0 5.5 4.5 10 10 10s10-4.5 10-10c0-6-4-12-10-20Z"
            fill="#f5b72e"
            opacity="0.85"
          />
        </g>
        <circle cx="1000" cy="400" r="30" fill="#1a1d21" stroke="#c0c0c0" strokeWidth="3.5" />
        <circle cx="440" cy="400" r="30" fill="#1a1d21" stroke="#f5b72e" strokeWidth="3.5" />
        <circle cx="720" cy="580" r="28" fill="#1a1d21" stroke="#cd7f32" strokeWidth="3.5" />
        <circle cx="880" cy="260" r="22" fill="#1a1d21" stroke="#c0c0c0" strokeWidth="2.5" />
        <circle cx="560" cy="260" r="22" fill="#1a1d21" stroke="#cd7f32" strokeWidth="2.5" />

        {/* Athlete silhouettes with blue energy trails */}
        {[
          { x: 340, y: 310, rot: -30, scale: 1.2 },
          { x: 1100, y: 330, rot: 20, scale: 1.1 },
          { x: 390, y: 510, rot: 145, scale: 1 },
          { x: 1050, y: 520, rot: -155, scale: 1.05 },
          { x: 580, y: 250, rot: -8, scale: 0.95 },
          { x: 860, y: 255, rot: 12, scale: 0.95 },
          { x: 720, y: 680, rot: 0, scale: 1.15 },
          { x: 250, y: 420, rot: 90, scale: 0.9 },
          { x: 1190, y: 430, rot: -90, scale: 0.9 },
        ].map((a, i) => (
          <g
            key={i}
            transform={`translate(${a.x} ${a.y}) rotate(${a.rot}) scale(${a.scale})`}
            filter="url(#blue-glow)"
          >
            <ellipse cx="0" cy="4" rx="22" ry="10" fill="rgba(0, 140, 220, 0.2)" />
            <path
              d="M-8 10 L0 -18 L8 10 M0 -8 L12 4 M0 -8 L-12 4 M-4 10 L4 10"
              fill="none"
              stroke="rgba(100, 210, 255, 0.8)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M-18 6 Q-28 0 -22 -8"
              fill="none"
              stroke="rgba(60, 180, 255, 0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Inner floor */}
        <ellipse cx="720" cy="400" rx="190" ry="105" fill="#16181c" opacity="0.65" />
        <ellipse cx="720" cy="400" rx="130" ry="72" fill="#22252a" opacity="0.55" />
      </svg>
    </div>
  );
}
