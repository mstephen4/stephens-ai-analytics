"use client";

import { PLAN_PRICING } from "@/lib/subscription";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ColiseumBackdrop } from "./ColiseumBackdrop";
import { LogoMark } from "./LogoMark";
import { TorchIcon } from "./TorchIcon";

export function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const launch = (mode?: "compare" | "podium" | "coach" | "plans") => {
    if (mode === "plans") {
      router.push("/events?subscribe=1");
      return;
    }
    const params = new URLSearchParams();
    if (prompt.trim()) params.set("q", prompt.trim());
    if (mode === "podium") params.set("mode", "podium");
    if (mode === "compare") params.set("mode", "compare");
    if (mode === "coach") {
      params.set("mode", "podium");
      params.set("coach", "1");
    }
    if (mode === "podium" || mode === "coach") params.set("trial", "1");
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
            <strong>Free Pro trial</strong> — Single {PLAN_PRICING.single.monthly.label} / {PLAN_PRICING.single.yearly.label} · Compare{" "}
            {PLAN_PRICING.compare.monthly.label} / {PLAN_PRICING.compare.yearly.label} · Pro {PLAN_PRICING.pro.monthly.label} /{" "}
            {PLAN_PRICING.pro.yearly.label}. BYOK · no hosted model credits.
          </p>
          <button type="button" className="gold-btn olympiad-trial-banner-btn" onClick={startTrial}>
            Start free trial
          </button>
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
            <button type="button" className="olympiad-nav-pro" onClick={() => launch("podium")}>
              Podium
              <span className="pro-badge">Pro</span>
            </button>
            <button type="button" className="olympiad-nav-pro" onClick={() => launch("coach")}>
              Coach
              <span className="pro-badge">Pro</span>
            </button>
            <Link href="/about" className="olympiad-nav-link">
              About
            </Link>
            <button type="button" className="gold-btn olympiad-nav-trial-btn" onClick={startTrial}>
              Free trial
            </button>
          </nav>
        </header>

        <main className="olympiad-main">
          <section className="olympiad-hero-copy">
            <h1>The games are always on.</h1>
            <p className="olympiad-tagline">
              EVERY METRIC. FOR PEAK. A PERPETUAL DATA STREAM, ATHLETES UNIFIED ON A GRAND PLATFORM.
            </p>
            <div className="olympiad-trial-hero">
              <button type="button" className="gold-btn olympiad-trial-hero-btn" onClick={startTrial}>
                Start free Pro trial
              </button>
              <p className="olympiad-trial-note">
                <strong>All modes · one vault · sign in with email · keys stay local</strong>
              </p>
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
