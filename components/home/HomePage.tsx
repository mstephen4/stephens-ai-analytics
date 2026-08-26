"use client";

import { PLAN_PRICING } from "@/lib/subscription";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginButton } from "@/components/auth/LoginPopup";
import { ColiseumBackdrop } from "./ColiseumBackdrop";
import { LogoMark } from "./LogoMark";
import { TorchIcon } from "./TorchIcon";

export function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const launch = (mode?: "compare" | "plans") => {
    if (mode === "plans") {
      router.push("/pricing");
      return;
    }
    const params = new URLSearchParams();
    if (prompt.trim()) params.set("q", prompt.trim());
    if (mode === "compare") params.set("mode", "compare");
    const query = params.toString();
    router.push(`/events${query ? `?${query}` : ""}`);
  };

  const startTrial = () => {
    router.push("/events?trial=1");
  };

  return (
    <div className="olympiad-home">
      <ColiseumBackdrop />

      <div className="olympiad-overlay">
        <div className="olympiad-trial-banner">
          <p>
            <strong>Subscribe first</strong> — no API keys at checkout. Single {PLAN_PRICING.single.monthly.label} /{" "}
            {PLAN_PRICING.single.yearly.label} · Compare {PLAN_PRICING.compare.monthly.label} /{" "}
            {PLAN_PRICING.compare.yearly.label} · Pro {PLAN_PRICING.pro.monthly.label} /{" "}
            {PLAN_PRICING.pro.yearly.label}. Or try Pro free for 3 days.
          </p>
          <div className="olympiad-trial-banner-actions">
            <Link href="/pricing" className="gold-btn olympiad-trial-banner-btn">
              View plans
            </Link>
            <LoginButton variant="banner" />
          </div>
        </div>

        <header className="olympiad-header">
          <Link href="/" className="logo-container">
            <LogoMark />
            <span className="logo-text">AI Olympiad</span>
          </Link>
          <nav className="olympiad-nav">
            <button type="button" onClick={() => launch()}>
              Events
            </button>
            <button type="button" className="gold-btn olympiad-nav-plans-btn" onClick={() => launch("plans")}>
              Plans
            </button>
            <Link href="/about" className="olympiad-nav-link">
              About
            </Link>
          </nav>
        </header>

        <main className="olympiad-main">
          <section className="olympiad-hero-copy">
            <h1>The games are always on.</h1>
            <p className="olympiad-tagline">
              EVERY METRIC. FOR PEAK. A PERPETUAL DATA STREAM, ATHLETES UNIFIED ON A GRAND PLATFORM.
            </p>
            <div className="olympiad-trial-hero">
              <Link href="/pricing" className="gold-btn olympiad-trial-hero-btn">
                View plans
              </Link>
              <button type="button" className="olympiad-trial-hero-secondary" onClick={startTrial}>
                Free Pro trial
              </button>
            </div>
          </section>

          <form
            className="input-section"
            onSubmit={(e) => {
              e.preventDefault();
              launch("compare");
            }}
          >
            <div className="search-container">
              <span className="torch-icon" aria-hidden>
                <TorchIcon />
              </span>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Light the torch — ask anything"
                aria-label="Ask a question"
              />
            </div>
          </form>

          <section className="podium-section" aria-label="Podium preview">
            <div className="card silver">
              <h2>Silver</h2>
            </div>
            <div className="card model-card elevated">
              <div className="judges-citation-label">Judge&apos;s Citation</div>
              <div className="model-name">Model name</div>
            </div>
            <div className="card bronze">
              <h2>Bronze</h2>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
