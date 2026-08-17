export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden>
      {/* Gear outer ring */}
      <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 20 + Math.cos(rad) * 12;
        const y1 = 20 + Math.sin(rad) * 12;
        const x2 = 20 + Math.cos(rad) * 16;
        const y2 = 20 + Math.sin(rad) * 16;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        );
      })}
      {/* Inner gear hub */}
      <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      {/* Circuit traces */}
      <path
        d="M20 6 L20 10 M20 30 L20 34 M6 20 L10 20 M30 20 L34 20"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
        strokeLinecap="round"
      />
      <path
        d="M12 12 L16 16 M28 12 L24 16 M12 28 L16 24 M28 28 L24 24"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.85" />
      {/* Circuit nodes */}
      <circle cx="20" cy="8" r="1.2" fill="currentColor" opacity="0.6" />
      <circle cx="32" cy="20" r="1.2" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="32" r="1.2" fill="currentColor" opacity="0.6" />
      <circle cx="8" cy="20" r="1.2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
