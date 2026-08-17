import type { Metadata } from "next";
import Link from "next/link";
import { AboutContent } from "@/components/about/AboutContent";
import { LogoMark } from "@/components/home/LogoMark";
import { PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About — ${PRODUCT_NAME}`,
  description:
    "How AI Olympiad goes beyond ChatHub: Podium judging, Coach routing, live metrics, and BYOK privacy.",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-page-header">
        <Link href="/" className="logo-container">
          <LogoMark />
          <span className="logo-text">AI Olympiad</span>
        </Link>
        <nav className="about-page-nav">
          <Link href="/events">Events</Link>
          <Link href="/about" aria-current="page">
            About
          </Link>
        </nav>
      </header>
      <main className="about-page-main">
        <AboutContent />
      </main>
    </div>
  );
}
