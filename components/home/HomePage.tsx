"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ColiseumBackdrop } from "./ColiseumBackdrop";
import { LogoMark } from "./LogoMark";
import { TorchIcon } from "./TorchIcon";

export function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const launch = (mode?: "compare" | "podium" | "coach") => {
    const params = new URLSearchParams();
    if (prompt.trim()) params.set("q", prompt.trim());
    if (mode) params.set("mode", mode);
    if (mode === "coach") params.set("coach", "1");
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
        <header className="olympiad-header">
          <Link href="/" className="logo-container">
            <LogoMark />
            <span className="logo-text">AI Olympiad</span>
          </Link>
          <nav className="olympiad-nav">
            <button type="button" onClick={() => launch()}>
              Events
            </button>
            <button type="button" onClick={() => launch("podium")}>
              Podium
            </button>
            <button type="button" onClick={() => launch("coach")}>
              Coach
            </button>
            <Link href="/about" className="olympiad-nav-link">
              About
            </Link>
            <button type="button" className="olympiad-nav-trial" onClick={startTrial}>
              Free trial
            </button>
          </nav>
        </header>

        <main className="olympiad-main">
          <section className="olympiad-hero-copy">
            <h1>The games are always on.</h1>
            <p>
              EVERY METRIC. FOR PEAK. A PERPETUAL DATA STREAM, ATHLETES UNIFIED ON A GRAND PLATFORM.
            </p>
            <p className="olympiad-trial-cta">
              <button type="button" onClick={startTrial}>
                Start free Pro trial
              </button>
              <span> — Podium &amp; Coach · BYOK · no hosted model credits</span>
            </p>
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
