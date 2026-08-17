import Link from "next/link";

type AboutContentProps = {
  compact?: boolean;
};

export function AboutContent({ compact = false }: AboutContentProps) {
  return (
    <article className={compact ? "about-content compact" : "about-content"}>
      {!compact ? (
        <header className="about-hero">
          <p className="about-kicker">Beyond side-by-side compare</p>
          <h1>AI Olympiad</h1>
          <p className="about-lede">
            Compare models. Let the Coach route. Let the Judge decide. Your keys, your data, your costs.
          </p>
          <div className="about-cta-row">
            <Link href="/events" className="gold-btn about-cta">
              Enter the arena
            </Link>
            <Link href="/" className="ghost-btn about-cta">
              Home
            </Link>
          </div>
        </header>
      ) : null}

      <section className="about-section">
        <h2>Where we go beyond ChatHub</h2>
        <p>
          <a href="https://chathub.gg">ChatHub</a> is a hosted all-in-one hub — one subscription, many models, many
          tools. AI Olympiad keeps the core compare workflow but adds a <strong>Judge</strong>, a{" "}
          <strong>Coach</strong>, and an Olympic metaphor on a <strong>BYOK, local-first</strong> stack.
        </p>
      </section>

      <section className="about-section">
        <h2>The Podium &amp; Judge</h2>
        <p>
          In <strong>Podium mode</strong>, one prompt fans out to up to six models. When every lane finishes, a
          separate <strong>Judge</strong> ranks 1st, 2nd, and 3rd — gold, silver, bronze — plus a one-sentence{" "}
          <strong>Judge&apos;s Citation</strong>.
        </p>
        <ul className="about-list">
          <li>The Judge is <strong>never</strong> one of the competitors.</li>
          <li>
            We pick an impartial, cost-efficient model from your vault (typically Gemini Flash, GPT-4o Mini, or Claude
            Haiku).
          </li>
          <li>
            Scoring criteria: accuracy, instruction-following, formatting, and completeness — brand prestige ignored.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>The Coach</h2>
        <p>
          <strong>The Coach</strong> (Pro / Lifetime) is a cost-aware model router. It reads your prompt and recommends
          the cheapest athlete that can still win the event — not the most famous model.
        </p>
        <ol className="about-list ordered">
          <li>
            <strong>Heuristic (instant, local)</strong> — detects intent (code, math, creative, translation, etc.) and
            complexity, then picks from your available keys.
          </li>
          <li>
            <strong>Classifier (optional)</strong> — a cheap model confirms the pick in JSON; falls back to the heuristic
            if the call fails.
          </li>
        </ol>
        <p className="about-note">
          The Coach advises while you type. In Single mode, tap <strong>Use model</strong> to apply it. Compare and
          Podium lanes stay under your control.
        </p>
      </section>

      <section className="about-section">
        <h2>Metrics</h2>
        <p>Every finished lane shows a live scoreboard:</p>
        <div className="about-metrics-grid">
          <div>
            <h3>Time</h3>
            <p>Wall-clock generation from first token to done.</p>
          </div>
          <div>
            <h3>Tok/s</h3>
            <p>Output tokens per second — stream speed.</p>
          </div>
          <div>
            <h3>Cost</h3>
            <p>Estimated USD from token usage × published per-million rates. Your provider bills you — not Olympiad.</p>
          </div>
        </div>
        <p className="about-note">Roadmap: event totals, personal bests, podium win rates, and Coach vs Judge accuracy.</p>
      </section>

      <section className="about-section">
        <h2>The Olympiad metaphor</h2>
        <table className="about-table">
          <thead>
            <tr>
              <th>ChatHub-ish</th>
              <th>AI Olympiad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chat session</td>
              <td>Event</td>
            </tr>
            <tr>
              <td>Model</td>
              <td>Athlete</td>
            </tr>
            <tr>
              <td>Side-by-side answers</td>
              <td>Lanes</td>
            </tr>
            <tr>
              <td>Pick your favorite</td>
              <td>Podium + Judge&apos;s Citation</td>
            </tr>
            <tr>
              <td>Model picker</td>
              <td>Coach</td>
            </tr>
            <tr>
              <td>API keys</td>
              <td>Vault</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="about-section">
        <h2>Your keys, your data</h2>
        <ul className="about-list">
          <li>API keys live in the <strong>Vault</strong> on this device (optional AES-GCM encryption).</li>
          <li>Chat history lives in <strong>IndexedDB</strong> — never synced to GitHub or a cloud account.</li>
          <li>
            Free tier: Single + 2-model Compare. Pro unlocks Podium (6 lanes + Judge) and Coach routing.
          </li>
          <li>Install as a PWA from your browser&apos;s Add to Home Screen prompt.</li>
        </ul>
      </section>

      {!compact ? (
        <section className="about-section">
          <h2>Get started in five minutes</h2>
          <p>
            Open the Locker Room on <Link href="/events">Events</Link>, choose a starter provider (Google, Groq, or
            OpenAI), paste one API key, tap <strong>Test key</strong>, and save. You do not need all seven providers on
            day one.
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
          <dt>Which AI judges?</dt>
          <dd>A cheap judge-eligible model from your vault — never a podium competitor.</dd>
          <dt>What does Coach do?</dt>
          <dd>Classifies your prompt and recommends the most cost-effective capable model.</dd>
          <dt>How do metrics work?</dt>
          <dd>Per-lane time, tok/s, and estimated cost from token usage.</dd>
          <dt>Do I need every provider?</dt>
          <dd>No. One key is enough to start compare with models from that provider.</dd>
        </dl>
      </section>
    </article>
  );
}
