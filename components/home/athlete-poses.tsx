type PoseProps = {
  glow?: "blue" | "gold";
};

/** Wireframe runner facing up — used at 12 o'clock outer pair */
export function PoseRunnerUp({ glow = "blue" }: PoseProps) {
  const stroke = glow === "gold" ? "var(--glowing-gold)" : "var(--glowing-blue)";
  return (
    <svg className="athlete-svg" viewBox="0 0 40 48" aria-hidden>
      <ellipse cx="20" cy="26" rx="10" ry="4" fill="rgba(61, 226, 248, 0.12)" />
      <circle cx="20" cy="10" r="3.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M20 14 L20 28 M20 20 L14 25 M20 20 L26 25 M20 28 L16 38 M20 28 L24 38"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Wireframe runner facing right */
export function PoseRunnerRight({ glow = "blue" }: PoseProps) {
  const stroke = glow === "gold" ? "var(--glowing-gold)" : "var(--glowing-blue)";
  return (
    <svg className="athlete-svg" viewBox="0 0 48 40" aria-hidden>
      <ellipse cx="24" cy="24" rx="10" ry="4" fill="rgba(61, 226, 248, 0.12)" />
      <circle cx="14" cy="14" r="3.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M18 18 L32 18 M22 12 L32 18 M22 12 L22 26 M32 18 L38 14 M32 18 L38 22"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** pose-sprinter-01 — upright sprinter lean */
export function PoseSprinter01({ glow = "blue" }: PoseProps) {
  const stroke = glow === "gold" ? "var(--glowing-gold)" : "var(--glowing-blue)";
  return (
    <svg className="athlete-svg" viewBox="0 0 48 40" aria-hidden>
      <ellipse cx="24" cy="26" rx="11" ry="4" fill="rgba(61, 226, 248, 0.12)" />
      <circle cx="16" cy="14" r="3.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M12 22 L28 12 M28 12 L34 16 M28 12 L24 24 M24 24 L32 30 M24 24 L16 26"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** pose-sprinter-03 — low aggressive lean */
export function PoseSprinter03({ glow = "blue" }: PoseProps) {
  const stroke = glow === "gold" ? "var(--glowing-gold)" : "var(--glowing-blue)";
  return (
    <svg className="athlete-svg" viewBox="0 0 48 36" aria-hidden>
      <ellipse cx="26" cy="24" rx="11" ry="4" fill="rgba(61, 226, 248, 0.12)" />
      <circle cx="14" cy="16" r="3.2" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M10 24 L30 14 M30 14 L36 18 M30 14 L26 26 M26 26 L34 30 M26 26 L18 28"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** pose-javelin-03 — body only; shaft via .javelin-athlete::after */
export function PoseJavelin03Body({ glow = "gold" }: PoseProps) {
  const stroke = glow === "gold" ? "var(--glowing-gold)" : "var(--glowing-blue)";
  return (
    <svg className="athlete-svg" viewBox="0 0 48 40" aria-hidden>
      <ellipse cx="22" cy="24" rx="9" ry="4" fill="rgba(252, 194, 28, 0.08)" />
      <circle cx="14" cy="14" r="3.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M12 20 L22 16 M22 16 L22 28 M22 16 L16 22 M22 28 L18 32 M22 28 L26 32"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
