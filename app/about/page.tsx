import Link from "next/link";
import { AboutContent } from "@/components/about/AboutContent";
import { LogoMark } from "@/components/home/LogoMark";

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
