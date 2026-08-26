import Link from "next/link";
import { LogoMark } from "@/components/home/LogoMark";
import { LoginButton } from "@/components/auth/LoginPopup";

type SitePage = "home" | "events" | "pricing" | "about";

export function SiteHeader({ current }: { current?: SitePage }) {
  return (
    <header className="site-header">
      <Link href="/" className="logo-container">
        <LogoMark />
        <span className="logo-text">AI Olympiad</span>
      </Link>
      <nav className="site-nav" aria-label="Site">
        <Link href="/events" aria-current={current === "events" ? "page" : undefined}>
          Events
        </Link>
        <Link href="/pricing" className="site-nav-plans" aria-current={current === "pricing" ? "page" : undefined}>
          Plans
        </Link>
        <Link href="/about" aria-current={current === "about" ? "page" : undefined}>
          Tutorial
        </Link>
        <Link href="/events?trial=1" className="gold-btn site-nav-trial">
          Free trial
        </Link>
        <LoginButton variant="nav" />
      </nav>
    </header>
  );
}
