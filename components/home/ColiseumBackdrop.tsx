import { ArenaAthletes } from "./ArenaAthletes";
import { MedalToken, PodiumMechanism } from "./schematic-icons";

const CX = 720;
const CY = 420;

export function ColiseumBackdrop() {
  const spokes = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <div className="coliseum-backdrop" aria-hidden>
      <div className="arena-schematic">
        <svg className="coliseum-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="circuit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M40 0 H0 V40 M20 0 V40 M0 20 H40"
                fill="none"
                stroke="rgba(61,226,248,0.06)"
                strokeWidth="0.5"
              />
              <circle cx="20" cy="20" r="1" fill="rgba(252,194,28,0.08)" />
            </pattern>
            <pattern id="metal-texture" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="#0e1014" />
              <path
                d="M0 40 H80 M40 0 V80 M10 10 L70 70 M70 10 L10 70"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="arena-glow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="rgba(255, 224, 130, 0.35)" />
              <stop offset="40%" stopColor="rgba(61, 226, 248, 0.08)" />
              <stop offset="100%" stopColor="rgba(12, 13, 16, 0)" />
            </radialGradient>
            <radialGradient id="core-gold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe082" />
              <stop offset="100%" stopColor="#fcc21c" />
            </radialGradient>
            <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(252,194,28,0.15)" />
              <stop offset="50%" stopColor="rgba(252,194,28,0.85)" />
              <stop offset="100%" stopColor="rgba(252,194,28,0.15)" />
            </linearGradient>
            <linearGradient id="ring-blue" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(61,226,248,0.15)" />
              <stop offset="50%" stopColor="rgba(61,226,248,0.75)" />
              <stop offset="100%" stopColor="rgba(61,226,248,0.15)" />
            </linearGradient>
            <linearGradient id="beam-gold" x1="0.5" y1="1" x2="0.5" y2="0">
              <stop offset="0%" stopColor="rgba(252, 194, 28, 0.8)" />
              <stop offset="60%" stopColor="rgba(252, 194, 28, 0.25)" />
              <stop offset="100%" stopColor="rgba(252, 194, 28, 0)" />
            </linearGradient>
            <filter id="gold-glow">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1440" height="900" fill="url(#metal-texture)" />
          <rect width="1440" height="900" fill="url(#circuit-grid)" />
          <ellipse cx={CX} cy={CY} rx="740" ry="480" fill="url(#arena-glow)" />

          {[640, 580, 520, 460, 400, 340, 280, 220, 160].map((rx, i) => (
            <ellipse
              key={rx}
              cx={CX}
              cy={CY}
              rx={rx}
              ry={rx * 0.54}
              fill="none"
              stroke={i % 2 === 0 ? "url(#ring-blue)" : "url(#ring-gold)"}
              strokeWidth={i < 3 ? 2 : 1.2}
              opacity={0.55 - i * 0.04}
            />
          ))}

          {spokes.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={CX}
                y1={CY}
                x2={CX + Math.cos(rad) * 660}
                y2={CY + Math.sin(rad) * 356}
                stroke={deg % 30 === 0 ? "rgba(252,194,28,0.25)" : "rgba(61,226,248,0.12)"}
                strokeWidth={deg % 30 === 0 ? 1.2 : 0.6}
              />
            );
          })}

          <line x1={CX} y1={CY - 340} x2={CX} y2={CY + 340} stroke="rgba(252,194,28,0.2)" strokeWidth="1" />
          <line x1={CX - 620} y1={CY} x2={CX + 620} y2={CY} stroke="rgba(61,226,248,0.2)" strokeWidth="1" />

          <rect x={CX - 6} y={0} width={12} height={900} fill="url(#beam-gold)" opacity="0.55" />
          <rect x={CX - 2} y={0} width={4} height={900} fill="rgba(255,248,225,0.35)" opacity="0.4" />

          <PodiumMechanism cx={CX} cy={CY} />

          <MedalToken cx={CX} cy={CY - 95} r={34} metal="gold" />
          <MedalToken cx={CX + 95} cy={CY} r={34} metal="silver" />
          <MedalToken cx={CX} cy={CY + 95} r={34} metal="bronze" />
          <MedalToken cx={CX - 95} cy={CY} r={34} metal="silver" />

          <ellipse cx={CX} cy={CY} rx="175" ry="95" fill="rgba(14,16,20,0.55)" stroke="rgba(61,226,248,0.2)" strokeWidth="1" />
          <ellipse cx={CX} cy={CY} rx="115" ry="62" fill="rgba(22,24,28,0.45)" stroke="rgba(252,194,28,0.15)" strokeWidth="0.8" />
        </svg>

        <div className="arena-athletes-layer">
          <ArenaAthletes />
        </div>
      </div>

      <div className="coliseum-vignette" />
    </div>
  );
}
