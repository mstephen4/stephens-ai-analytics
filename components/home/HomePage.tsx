"use client";

import { PLAN_PRICING } from "@/lib/subscription";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PricingPlans } from "@/components/arena/PricingPlans";
import { ColiseumBackdrop } from "./ColiseumBackdrop";
import { LogoMark } from "./LogoMark";
import { TorchIcon } from "./TorchIcon";

export function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const launch = (mode?: "compare" | "podium" | "coach" | "plans") => {
    if (mode === "plans") {
      router.push("/pricing");
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
    if (mode === "podium" || mode === "coach") params.set("subscribe", "1");
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
          <Link href="/pricing" className="gold-btn olympiad-trial-banner-btn">
            View plans
          </Link>
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
            <Link href="/pricing" className="olympiad-nav-link">
              Pricing
            </Link>
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
              <p className="olympiad-trial-note">
                <strong>Subscribe first · add API keys after · one vault · keys stay local</strong>
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

          <section className="olympiad-pricing-section" aria-label="Subscription plans">
            <div className="olympiad-pricing-copy">
              <p className="brand-kicker">OLYMPIC PASS</p>
              <h2>Pick a plan — no API keys required</h2>
              <p className="hint">
                Checkout via Stripe, then sign in on Events with the same email. Add keys in the Vault when you&apos;re
                ready to chat.
              </p>
            </div>
            <PricingPlans />
          </section>
        </main>
      </div>
    </div>
  );
}
