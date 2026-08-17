"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StadiumDiagram } from "./StadiumDiagram";

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

  return (
    <div className="olympiad-home">
      <header className="olympiad-header">
        <Link href="/" className="logo-container">
          <span className="logo-icon" aria-hidden>
            ☼
          </span>
          <span className="logo-text">OLYMPIAD</span>
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
        </nav>
      </header>

      <main className="olympiad-main">
        <div className="olympiad-landscape">
          <div className="olympiad-intro">
            <h1>The games are always on.</h1>
            <p>
              EVERY METRIC. FOR PEAK. A PERPETUAL DATA STREAM, ATHLETES UNIFIED ON A GRAND PLATFORM.
            </p>
          </div>
          <StadiumDiagram />
        </div>

        <form
          className="input-section"
          onSubmit={(e) => {
            e.preventDefault();
            launch("compare");
          }}
        >
          <div className="search-container">
            <span className="torch-icon" aria-hidden>
              🔥
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
          <div className="card model-card">
            <div className="judges-citation-label">Judge&apos;s citation</div>
            <div className="model-name">Model name</div>
            <p>&quot;It excelled in tone, structure, and word choice.&quot;</p>
          </div>
          <div className="card bronze">
            <h2>Bronze</h2>
          </div>
        </section>
      </main>
    </div>
  );
}
