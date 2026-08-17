export function HeroArenaGraphic() {
  return (
    <div className="hero-arena-wrap" aria-hidden>
      <svg viewBox="0 0 420 420" className="hero-arena-svg">
        <defs>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,215,0,0.35)" />
            <stop offset="100%" stopColor="rgba(255,215,0,0)" />
          </radialGradient>
          <linearGradient id="goldMedal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe566" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
        <circle cx="210" cy="210" r="190" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle cx="210" cy="210" r="150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 8" />
        <circle cx="210" cy="210" r="110" fill="url(#spot)" />
        <line x1="210" y1="40" x2="210" y2="120" stroke="rgba(255,215,0,0.5)" strokeWidth="2" />
        {[
          { cx: 210, cy: 88, fill: "url(#goldMedal)", r: 28 },
          { cx: 120, cy: 170, fill: "#c0c0c0", r: 22 },
          { cx: 300, cy: 170, fill: "#cd7f32", r: 22 },
          { cx: 150, cy: 280, fill: "#5a6270", r: 18 },
          { cx: 270, cy: 280, fill: "#5a6270", r: 18 },
        ].map((medal, i) => (
          <g key={i}>
            <circle cx={medal.cx} cy={medal.cy} r={medal.r} fill={medal.fill} opacity="0.95" />
            <circle cx={medal.cx} cy={medal.cy} r={medal.r - 6} fill="none" stroke="rgba(0,0,0,0.25)" />
            <path
              d={`M${medal.cx - 6} ${medal.cy + 4} L${medal.cx} ${medal.cy - 8} L${medal.cx + 6} ${medal.cy + 4}`}
              fill="none"
              stroke="rgba(26,29,33,0.5)"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
