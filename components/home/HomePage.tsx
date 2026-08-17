"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flame } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import { HeroArenaGraphic } from "./HeroArenaGraphic";

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
    <div className="home-shell">
      <header className="home-nav">
        <Link href="/" className="home-logo">
          <span className="logo-orbit" aria-hidden />
          <span className="logo-text">{PRODUCT_NAME.toUpperCase()}</span>
        </Link>
        <nav className="home-links">
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

      <section className="home-hero">
        <div className="hero-copy">
          <h1>The games are always on</h1>
          <p>
            One prompt. Multiple models. Side-by-side answers from OpenAI, Anthropic, Google, DeepSeek,
            Grok, Llama, and Mistral — with your own keys.
          </p>
        </div>
        <HeroArenaGraphic />
      </section>

      <form
        className="home-torch-bar"
        onSubmit={(e) => {
          e.preventDefault();
          launch("compare");
        }}
      >
        <Flame size={20} className="torch-icon" aria-hidden />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Light the torch — ask anything"
          aria-label="Ask a question"
        />
        <button type="submit" className="home-go">
          Go
        </button>
      </form>

      <section className="home-podium-preview" aria-label="Podium preview">
        <article className="preview-card silver">
          <span>Silver</span>
        </article>
        <article className="preview-card gold">
          <span className="citation-badge">Judge&apos;s citation</span>
          <strong>Model name</strong>
          <p>Ranked first for accuracy, formatting, and instruction-following.</p>
        </article>
        <article className="preview-card bronze">
          <span>Bronze</span>
        </article>
      </section>

      <footer className="home-foot">
        <p>BYOK · Local history · Installable PWA</p>
        <Link href="/events">Open events →</Link>
      </footer>
    </div>
  );
}
