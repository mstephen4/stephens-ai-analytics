import {
  CircuitGridBox,
  DataGridBox,
  JavelinThrowerRight,
  MedalToken,
  PodiumMechanism,
  ringPoint,
  RunnerRight,
  RunnerUp,
  SprinterRight,
} from "./schematic-icons";

const CX = 720;
const CY = 420;
const OUTER_RX = 560;
const OUTER_RY = 300;

export function ColiseumBackdrop() {
  const spokes = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <div className="coliseum-backdrop" aria-hidden>
      <div className="coliseum-vignette" />
      <svg className="coliseum-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="circuit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M40 0 H0 V40 M20 0 V40 M0 20 H40"
              fill="none"
              stroke="rgba(60,180,255,0.06)"
              strokeWidth="0.5"
            />
            <circle cx="20" cy="20" r="1" fill="rgba(245,183,46,0.08)" />
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
            <stop offset="40%" stopColor="rgba(80, 200, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(12, 13, 16, 0)" />
          </radialGradient>
          <radialGradient id="core-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="100%" stopColor="#f5b72e" />
          </radialGradient>
          <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(245,183,46,0.15)" />
            <stop offset="50%" stopColor="rgba(245,183,46,0.85)" />
            <stop offset="100%" stopColor="rgba(245,183,46,0.15)" />
          </linearGradient>
          <linearGradient id="ring-blue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(60,180,255,0.15)" />
            <stop offset="50%" stopColor="rgba(80,200,255,0.75)" />
            <stop offset="100%" stopColor="rgba(60,180,255,0.15)" />
          </linearGradient>
          <linearGradient id="beam-gold" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="rgba(245, 183, 46, 0.8)" />
            <stop offset="60%" stopColor="rgba(245, 183, 46, 0.25)" />
            <stop offset="100%" stopColor="rgba(245, 183, 46, 0)" />
          </linearGradient>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="blue-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#metal-texture)" />
        <rect width="1440" height="900" fill="url(#circuit-grid)" />
        <ellipse cx={CX} cy={CY} rx="740" ry="480" fill="url(#arena-glow)" />

        {/* Multi-tier coliseum blueprint rings */}
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

        {/* Radial divisions */}
        {spokes.map((deg) => {
          const outer = ringPoint(CX, CY, 660, 660 * 0.54, deg);
          return (
            <line
              key={deg}
              x1={CX}
              y1={CY}
              x2={outer.x}
              y2={outer.y}
              stroke={deg % 30 === 0 ? "rgba(245,183,46,0.25)" : "rgba(80,200,255,0.12)"}
              strokeWidth={deg % 30 === 0 ? 1.2 : 0.6}
            />
          );
        })}

        {/* Cardinal axis highlights */}
        <line x1={CX} y1={CY - 340} x2={CX} y2={CY + 340} stroke="rgba(245,183,46,0.2)" strokeWidth="1" />
        <line x1={CX - 620} y1={CY} x2={CX + 620} y2={CY} stroke="rgba(80,200,255,0.2)" strokeWidth="1" />

        {/* Central vertical light beam through focal point */}
        <rect x={CX - 6} y={0} width={12} height={900} fill="url(#beam-gold)" opacity="0.55" />
        <rect x={CX - 2} y={0} width={4} height={900} fill="rgba(255,248,225,0.35)" opacity="0.4" />

        {/* Center podium / starting block mechanism */}
        <PodiumMechanism cx={CX} cy={CY} />

        {/* Cross-pattern medal tokens: N gold, E silver, S bronze, W silver */}
        <MedalToken cx={CX} cy={CY - 95} r={34} metal="gold" />
        <MedalToken cx={CX + 95} cy={CY} r={34} metal="silver" />
        <MedalToken cx={CX} cy={CY + 95} r={34} metal="bronze" />
        <MedalToken cx={CX - 95} cy={CY} r={34} metal="silver" />

        {/* —— 14 cyborg figures —— */}

        {/* 12 o'clock outer: pair running upward (2) */}
        <g transform={`translate(${CX - 28} ${CY - OUTER_RY + 18})`}>
          <RunnerUp scale={1.05} />
        </g>
        <g transform={`translate(${CX + 28} ${CY - OUTER_RY + 18})`}>
          <RunnerUp scale={1.05} />
        </g>

        {/* 3 o'clock outer: javelin, sprinter, runner moving right (3) */}
        <g transform={`translate(${CX + OUTER_RX - 10} ${CY - 52})`}>
          <JavelinThrowerRight scale={1} />
        </g>
        <g transform={`translate(${CX + OUTER_RX - 6} ${CY})`}>
          <SprinterRight scale={1.05} />
        </g>
        <g transform={`translate(${CX + OUTER_RX - 10} ${CY + 52})`}>
          <RunnerRight scale={1} />
        </g>

        {/* 6 o'clock outer: pair running right (2) */}
        <g transform={`translate(${CX - 24} ${CY + OUTER_RY - 8})`}>
          <RunnerRight scale={1.05} />
        </g>
        <g transform={`translate(${CX + 24} ${CY + OUTER_RY - 8})`}>
          <RunnerRight scale={1.05} />
        </g>

        {/* 9 o'clock outer: javelin, sprinter, runner moving right (3) — mirrored toward center */}
        <g transform={`translate(${CX - OUTER_RX + 10} ${CY - 52}) scale(-1,1)`}>
          <JavelinThrowerRight scale={1} />
        </g>
        <g transform={`translate(${CX - OUTER_RX + 6} ${CY}) scale(-1,1)`}>
          <SprinterRight scale={1.05} />
        </g>
        <g transform={`translate(${CX - OUTER_RX + 10} ${CY + 52}) scale(-1,1)`}>
          <RunnerRight scale={1} />
        </g>

        {/* Inner top-left: javelin in circuit grid box (1) */}
        <CircuitGridBox x={500} y={248} w={88} h={72}>
          <JavelinThrowerRight scale={0.9} />
        </CircuitGridBox>

        {/* Inner bottom-left: sprinter in data grid box (1) */}
        <DataGridBox x={488} y={520} w={96} h={76}>
          <SprinterRight scale={0.85} />
        </DataGridBox>

        {/* Inner center-top: freestanding sprinter (1) */}
        <g transform={`translate(${CX} ${CY - 175})`}>
          <SprinterRight scale={0.95} />
        </g>

        {/* Inner center-left: smaller freestanding sprinter (1) */}
        <g transform={`translate(${CX - 118} ${CY - 8})`}>
          <SprinterRight scale={0.72} />
        </g>

        {/* Inner arena floor */}
        <ellipse cx={CX} cy={CY} rx="175" ry="95" fill="rgba(14,16,20,0.55)" stroke="rgba(80,200,255,0.2)" strokeWidth="1" />
        <ellipse cx={CX} cy={CY} rx="115" ry="62" fill="rgba(22,24,28,0.45)" stroke="rgba(245,183,46,0.15)" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
