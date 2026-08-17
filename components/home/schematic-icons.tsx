import type { ReactNode } from "react";

type FigureProps = {
  scale?: number;
};

const STROKE_BLUE = "rgba(80, 200, 255, 0.9)";
const STROKE_GOLD = "rgba(245, 183, 46, 0.85)";
const FILL_GLOW = "rgba(0, 160, 255, 0.15)";

function cyborgHead() {
  return (
    <>
      <ellipse cx="0" cy="6" rx="14" ry="6" fill={FILL_GLOW} />
      <circle cx="0" cy="-12" r="4" fill="none" stroke={STROKE_BLUE} strokeWidth="1.5" />
      <rect x="-3" y="-10" width="6" height="2" fill={STROKE_BLUE} opacity="0.5" rx="0.5" />
    </>
  );
}

/** Stick runner facing up (negative Y) */
export function RunnerUp({ scale = 1 }: FigureProps) {
  return (
    <g transform={`scale(${scale})`} filter="url(#blue-glow)">
      {cyborgHead()}
      <path
        d="M0 -8 L0 6 M0 0 L-7 5 M0 0 L7 5 M0 6 L-5 14 M0 6 L5 14"
        fill="none"
        stroke={STROKE_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M-10 10 Q-16 4 -12 -2" fill="none" stroke="rgba(60,180,255,0.5)" strokeWidth="1.2" />
    </g>
  );
}

/** Stick runner facing right (+X) */
export function RunnerRight({ scale = 1 }: FigureProps) {
  return (
    <g transform={`scale(${scale})`} filter="url(#blue-glow)">
      {cyborgHead()}
      <path
        d="M-6 0 L8 0 M0 -6 L8 0 M0 -6 L0 6 M8 0 L14 -4 M8 0 L14 4"
        fill="none"
        stroke={STROKE_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6 Q18 0 14 -6" fill="none" stroke="rgba(60,180,255,0.5)" strokeWidth="1.2" />
    </g>
  );
}

/** Sprinter — low forward lean, facing right */
export function SprinterRight({ scale = 1 }: FigureProps) {
  return (
    <g transform={`scale(${scale})`} filter="url(#blue-glow)">
      {cyborgHead()}
      <path
        d="M-8 2 L6 -4 M6 -4 L10 0 M6 -4 L4 6 M4 6 L10 10 M4 6 L-2 8"
        fill="none"
        stroke={STROKE_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 8 Q16 2 12 -4" fill="none" stroke="rgba(245,183,46,0.45)" strokeWidth="1.2" />
    </g>
  );
}

/** Javelin thrower facing right */
export function JavelinThrowerRight({ scale = 1 }: FigureProps) {
  return (
    <g transform={`scale(${scale})`} filter="url(#blue-glow)">
      {cyborgHead()}
      <path
        d="M-6 0 L4 -2 M4 -2 L4 6 M4 -2 L-2 4 M4 6 L0 10 M4 6 L8 10"
        fill="none"
        stroke={STROKE_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="4" y1="-2" x2="22" y2="-10" stroke={STROKE_GOLD} strokeWidth="1.8" strokeLinecap="round" />
      <polygon points="22,-10 26,-8 22,-6" fill={STROKE_GOLD} />
    </g>
  );
}

/** Running man icon inside medal token */
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

/** Circuit grid box container */
export function CircuitGridBox({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="rgba(14,16,20,0.75)"
        stroke="rgba(80,200,255,0.35)"
        strokeWidth="1"
        rx="2"
      />
      <path
        d={`M0 ${h * 0.3} H${w * 0.4} M${w * 0.6} ${h * 0.3} H${w} M0 ${h * 0.7} H${w * 0.25} M${w * 0.75} ${h * 0.7} H${w}`}
        stroke="rgba(245,183,46,0.25)"
        strokeWidth="0.8"
        fill="none"
      />
      <g transform={`translate(${w / 2} ${h / 2})`}>{children}</g>
    </g>
  );
}

/** Data grid box with finer lattice */
export function DataGridBox({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children: ReactNode;
}) {
  const cols = 4;
  const rows = 3;
  const lines: ReactNode[] = [];
  for (let c = 1; c < cols; c++) {
    lines.push(
      <line
        key={`c${c}`}
        x1={(w / cols) * c}
        y1={0}
        x2={(w / cols) * c}
        y2={h}
        stroke="rgba(80,200,255,0.15)"
        strokeWidth="0.6"
      />,
    );
  }
  for (let r = 1; r < rows; r++) {
    lines.push(
      <line
        key={`r${r}`}
        x1={0}
        y1={(h / rows) * r}
        x2={w}
        y2={(h / rows) * r}
        stroke="rgba(245,183,46,0.12)"
        strokeWidth="0.6"
      />,
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="rgba(12,14,18,0.8)"
        stroke="rgba(80,200,255,0.4)"
        strokeWidth="1.2"
        rx="2"
      />
      {lines}
      <g transform={`translate(${w / 2} ${h / 2})`}>{children}</g>
    </g>
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
    gold: { stroke: "#f5b72e", fill: "#1a1d21" },
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
      <rect x="-36" y="-12" width="72" height="24" fill="#16181c" stroke="rgba(245,183,46,0.5)" strokeWidth="1.5" rx="2" />
      <rect x="-24" y="-6" width="48" height="12" fill="#22252a" stroke="rgba(80,200,255,0.35)" strokeWidth="1" rx="1" />
      <line x1="-36" y1="0" x2="36" y2="0" stroke="rgba(245,183,46,0.3)" strokeWidth="0.8" />
      <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(80,200,255,0.3)" strokeWidth="0.8" />
      <circle r="6" fill="url(#core-gold)" filter="url(#gold-glow)" />
    </g>
  );
}

/** Polar position on elliptical arena ring */
export function ringPoint(cx: number, cy: number, rx: number, ry: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + rx * Math.cos(rad),
    y: cy + ry * Math.sin(rad),
  };
}
