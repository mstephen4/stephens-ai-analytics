export function TokenRunnerIcon() {
  return (
    <path
      d="M0 -7 L0 3 M0 -1 L5 3 M0 -1 L-5 3 M0 3 L-4 9 M0 3 L4 9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function MedalToken({
  cx,
  cy,
  r,
  metal,
}: {
  cx: number;
  cy: number;
  r: number;
  metal: "gold" | "silver" | "bronze";
}) {
  const colors = {
    gold: { stroke: "#fcc21c", fill: "#1a1d21" },
    silver: { stroke: "#c0c0c0", fill: "#1a1d21" },
    bronze: { stroke: "#cd7f32", fill: "#1a1d21" },
  };
  const c = colors[metal];
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={c.fill} stroke={c.stroke} strokeWidth="3.5" filter="url(#gold-glow)" />
      <circle r={r - 6} fill="none" stroke={c.stroke} strokeWidth="0.8" opacity="0.4" />
      <g color={c.stroke} transform="scale(1.3)">
        <TokenRunnerIcon />
      </g>
    </g>
  );
}

export function PodiumMechanism({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x="-36" y="-12" width="72" height="24" fill="#16181c" stroke="rgba(252,194,28,0.5)" strokeWidth="1.5" rx="2" />
      <rect x="-24" y="-6" width="48" height="12" fill="#22252a" stroke="rgba(61,226,248,0.35)" strokeWidth="1" rx="1" />
      <line x1="-36" y1="0" x2="36" y2="0" stroke="rgba(252,194,28,0.3)" strokeWidth="0.8" />
      <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(61,226,248,0.3)" strokeWidth="0.8" />
      <circle r="6" fill="url(#core-gold)" filter="url(#gold-glow)" />
    </g>
  );
}
