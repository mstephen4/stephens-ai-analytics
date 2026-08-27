import Link from "next/link";
import { PLAN_PRICING } from "@/lib/subscription";

type AboutContentProps = {
  compact?: boolean;
};

export function AboutContent({ compact = false }: AboutContentProps) {
  return (
    <article className={compact ? "about-content compact" : "about-content"}>
      {!compact ? (
        <header className="about-hero">
          <p className="about-kicker">About AI Olympiad</p>
          <h1>About AI Olympiad</h1>
          <p className="about-lede">
            A BYOK arena to compare AI models side-by-side, crown a Podium with an impartial Judge, and route prompts
            with a cost-aware Coach — your keys, your data, your costs.
          </p>
          <div className="about-cta-row">
            <Link href="/pricing" className="gold-btn about-cta">
              View plans
            </Link>
            <Link href="/events" className="ghost-btn about-cta">
              Enter Events
            </Link>
          </div>
        </header>
      ) : null}

      <section className="about-section">
        <h2>What it is</h2>
        <p>
          AI Olympiad is a progressive web app for multi-model comparison. Unlike hosted hubs that resell access, you
          bring your own API keys and pay providers directly. Olympiad unlocks the UI — Single chat, Compare lanes,
          Podium judging, and Coach routing — with a simple subscription.
        </p>
      </section>

      <section className="about-section">
        <h2>Three modes</h2>
        <ul className="about-list">
          <li>
            <strong>Single</strong> — one athlete, one conversation thread.
          </li>
          <li>
            <strong>Compare</strong> — two models answer the same prompt in parallel with live stats.
          </li>
          <li>
            <strong>Podium</strong> — up to six lanes; when every athlete finishes, a separate Judge ranks 1st, 2nd,
            and 3rd with a citation.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Coach &amp; metrics</h2>
        <p>
          <strong>Coach</strong> (Pro) reads your prompt and recommends the cheapest capable model from your vault.
          Every lane shows <strong>time</strong>, <strong>tok/s</strong>, and <strong>estimated cost</strong> so you can
          optimize spend across events.
        </p>
      </section>

      <section className="about-section">
        <h2>Plans</h2>
        <ul className="about-list">
          <li>
            <strong>Single</strong> — {PLAN_PRICING.single.monthly.label} / {PLAN_PRICING.single.yearly.label}
          </li>
          <li>
            <strong>Compare</strong> — {PLAN_PRICING.compare.monthly.label} / {PLAN_PRICING.compare.yearly.label}
          </li>
          <li>
            <strong>Pro</strong> — {PLAN_PRICING.pro.monthly.label} / {PLAN_PRICING.pro.yearly.label}
          </li>
          <li>
            <strong>Free trial</strong> — sign in with email for a short Pro trial before you subscribe.
          </li>
        </ul>
        <p className="about-note">
          <Link href="/pricing">View plans &amp; checkout →</Link>
        </p>
      </section>

      <section className="about-section">
        <h2>Privacy &amp; local-first</h2>
        <ul className="about-list">
          <li>API keys live in the <strong>Vault</strong> on this device (optional encryption).</li>
          <li>Chat history stays in <strong>IndexedDB</strong> — not synced to a cloud account.</li>
          <li>Install as a PWA from your browser&apos;s Add to Home Screen prompt.</li>
        </ul>
      </section>

      {!compact ? (
        <section className="about-section">
          <h2>Get started</h2>
          <p>
            Subscribe on <Link href="/pricing">Plans</Link>, sign in with the same email, then open{" "}
            <Link href="/events">Events</Link> → Locker Room → Vault to paste your first API key.
          </p>
        </section>
      ) : (
        <p className="about-note">
          <Link href="/about">Read the full About page →</Link>
        </p>
      )}

      <section className="about-section">
        <h2>FAQ</h2>
        <dl className="about-faq">
          <dt>Do I need every provider?</dt>
          <dd>No. One key is enough to start — add more when you want broader compare lanes.</dd>
          <dt>Which model judges the Podium?</dt>
          <dd>A cheap judge-eligible model from your vault — never one of the competitors.</dd>
          <dt>Does Olympiad bill my API usage?</dt>
          <dd>No. You pay OpenAI, Google, Anthropic, and others directly.</dd>
        </dl>
      </section>
    </article>
  );
}
