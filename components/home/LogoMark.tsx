export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="8" r="2.2" fill="currentColor" />
      <circle cx="8" cy="18" r="2.2" fill="currentColor" />
      <circle cx="24" cy="18" r="2.2" fill="currentColor" />
      <circle cx="11" cy="26" r="2" fill="currentColor" opacity="0.85" />
      <circle cx="21" cy="26" r="2" fill="currentColor" opacity="0.85" />
      <path
        d="M16 10.2 L8 16.2 M16 10.2 L24 16.2 M8 18 L11 24 M24 18 L21 24 M11 24 L21 24"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.45"
        fill="none"
      />
    </svg>
  );
}
