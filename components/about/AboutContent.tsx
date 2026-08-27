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
            AI Olympiad goes beyond standard side-by-side model comparison. It is a local-first, Bring Your Own Key
            (BYOK) platform that lets you compare top AI models, route prompts intelligently, and objectively judge the
            best outputs. With AI Olympiad, your keys, your data, and your costs remain entirely in your control.
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
        <h2>The Olympic Metaphor</h2>
        <p>We use a sports metaphor to make managing multiple AI models intuitive and fun:</p>
        <ul className="about-list">
          <li>
            <strong>Event:</strong> A chat session.
          </li>
          <li>
            <strong>Athlete:</strong> An AI model.
          </li>
          <li>
            <strong>Lanes:</strong> Side-by-side model generations.
          </li>
          <li>
            <strong>Podium + Judge&apos;s Citation:</strong> The final ranking and evaluation of the models&apos;
            answers.
          </li>
          <li>
            <strong>Coach:</strong> The intelligent model picker.
          </li>
          <li>
            <strong>Vault:</strong> Where your API keys are stored safely.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Core Features</h2>
        <h3>The Podium &amp; Judge</h3>
        <p>
          In Podium mode, a single prompt fans out to up to six different models (Lanes). Once all models finish
          generating their responses, an impartial Judge ranks them 1st, 2nd, and 3rd (Gold, Silver, and Bronze) and
          provides a one-sentence &quot;Judge&apos;s Citation&quot; explaining the decision.
        </p>
        <ul className="about-list">
          <li>
            <strong>Impartiality:</strong> The Judge is never one of the competitors. It uses a cost-efficient model
            from your vault (typically Gemini Flash, GPT-4o Mini, or Claude Haiku).
          </li>
          <li>
            <strong>Scoring Criteria:</strong> Models are judged strictly on accuracy, instruction-following,
            formatting, and completeness. Brand prestige is ignored.
          </li>
        </ul>

        <h3>The Coach (Pro / Lifetime)</h3>
        <p>
          The Coach is your cost-aware model router. It analyzes your prompt while you type and recommends the cheapest
          &quot;athlete&quot; capable of winning the event—saving you money without sacrificing quality.
        </p>
        <ul className="about-list">
          <li>
            <strong>Heuristic (Instant, Local):</strong> Detects the prompt&apos;s intent (code, math, creative,
            translation, etc.) and complexity, then selects the best option from your available keys.
          </li>
          <li>
            <strong>Classifier (Optional):</strong> Uses a highly affordable model to confirm the pick in JSON, falling
            back to the heuristic if needed.
          </li>
        </ul>

        <h3>Live Metrics</h3>
        <p>Every finished lane features a live scoreboard displaying:</p>
        <ul className="about-list">
          <li>
            <strong>Time:</strong> Wall-clock generation time from the first token to completion.
          </li>
          <li>
            <strong>Tok/s:</strong> Output tokens per second (stream speed).
          </li>
          <li>
            <strong>Cost:</strong> Estimated USD based on token usage multiplied by the provider&apos;s published
            per-million rates. (Your provider bills you directly, not AI Olympiad.)
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Your Keys, Your Data</h2>
        <p>AI Olympiad is built on a privacy-first architecture.</p>
        <ul className="about-list">
          <li>Your API keys live exclusively in your device&apos;s Vault (with optional AES-GCM encryption).</li>
          <li>
            Your chat history is stored locally in IndexedDB and is never synced to the cloud or a third-party account.
          </li>
          <li>
            You can install AI Olympiad as a Progressive Web App (PWA) directly from your browser&apos;s &quot;Add to
            Home Screen&quot; prompt.
          </li>
          <li>See Lane Congestion info below.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Plans &amp; Pricing</h2>
        <p>
          AI Olympiad is a single-user subscription tied to your email. We do not sell model credits; you pay your
          chosen AI providers (OpenAI, Anthropic, Google, Groq, etc.) directly.
        </p>
        <ul className="about-list">
          <li>
            <strong>Free Trial:</strong> Sign in with your email for a short, full Pro trial before subscribing.
          </li>
          <li>
            <strong>Single</strong> ({PLAN_PRICING.single.monthly.label} or {PLAN_PRICING.single.yearly.label}):
            Single-mode chat + Vault UI.
          </li>
          <li>
            <strong>Compare</strong> ({PLAN_PRICING.compare.monthly.label} or {PLAN_PRICING.compare.yearly.label}):
            Compare mode + Podium (2 lanes + Judge).
          </li>
          <li>
            <strong>Pro</strong> ({PLAN_PRICING.pro.monthly.label} or {PLAN_PRICING.pro.yearly.label}): All modes +
            Coach + 6-lane Podium.
          </li>
        </ul>
        <p className="about-note">
          <Link href="/pricing">View plans &amp; checkout →</Link>
        </p>
      </section>

      {!compact ? (
        <section className="about-section">
          <h2>Get Started in Five Minutes</h2>
          <ol className="about-list ordered">
            <li>
              <strong>Sign In and Choose a Plan:</strong> Free trial available. Log in using your email address to
              activate your free Pro trial, or select the plan that fits your needs.
            </li>
            <li>
              <strong>Enter the Locker Room:</strong> Navigate to the Locker Room on the Events screen to manage your
              local API Vault.
            </li>
            <li>
              <strong>Add Your First Provider:</strong> Only one key is required to start. Choose Google, Groq, or
              OpenAI and paste your API key.
            </li>
            <li>
              <strong>Test and Save:</strong> Tap Test key, then save to your Vault. Optional AES-GCM encryption
              available.
            </li>
            <li>
              <strong>Enter the Arena:</strong> Start a new Event. On Pro, use Coach recommendations or switch to Podium
              mode.
            </li>
          </ol>
        </section>
      ) : (
        <p className="about-note">
          <Link href="/about">Read the full About page →</Link>
        </p>
      )}

      <section className="about-section">
        <h2>Frequently Asked Questions (FAQ)</h2>
        <dl className="about-faq">
          <dt>Do I need an API key for every single provider on day one?</dt>
          <dd>
            No. A single key is enough to get started. If you add one provider, you can immediately begin comparing
            different models offered by that specific provider.
          </dd>
          <dt>Which AI acts as the Judge?</dt>
          <dd>
            The system selects a cheap, judge-eligible model from your own Vault (like Gemini Flash or GPT-4o Mini). The
            Judge will never be one of the competitors in that specific Podium race.
          </dd>
          <dt>What exactly does the Coach do?</dt>
          <dd>
            The Coach classifies your prompt&apos;s intent (e.g., coding, creative writing, math) and complexity, then
            recommends the most cost-effective model in your Vault capable of handling that task.
          </dd>
          <dt>How do the metrics and cost estimates work?</dt>
          <dd>
            The scoreboard tracks real-time performance: wall-clock time and tokens per second. Cost is estimated from
            token usage × the provider&apos;s published API rates.
          </dd>
          <dt>Where is my chat history and data stored?</dt>
          <dd>
            Everything stays on your device. API keys are kept in your local Vault; chat logs are saved to IndexedDB. We
            never sync your data to a cloud account.
          </dd>
          <dt>What does the &quot;Lane Congestion&quot; message mean?</dt>
          <dd>
            Lane Congestion means an athlete&apos;s stream is being throttled or delayed—often from provider rate limits
            (HTTP 429), browser connection limits, or running many lanes from the same provider at once.
          </dd>
        </dl>
      </section>

      {!compact ? (
        <section className="about-section">
          <h2>Understanding &quot;Lane Congestion&quot;</h2>
          <p>
            When running multi-model events in Compare or Podium mode, you may occasionally see a Lane Congestion warning
            on one or more lanes. Because AI Olympiad runs client-side and fans out prompts to multiple AI APIs
            simultaneously, congestion occurs when a lane experiences throughput bottlenecks, stream delays, or API rate
            throttling.
          </p>
          <h3>Why Lane Congestion Occurs</h3>
          <table className="about-table">
            <thead>
              <tr>
                <th>Cause</th>
                <th>What&apos;s Happening</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Provider Rate Limits (RPM / TPM)</td>
                <td>
                  Multiple lanes from the same provider may hit Requests-Per-Minute or Tokens-Per-Minute caps, triggering
                  HTTP 429 Too Many Requests.
                </td>
              </tr>
              <tr>
                <td>Browser Connection Limits</td>
                <td>
                  Browsers cap concurrent HTTP/2 and SSE streams per domain (typically 6). Six heavy streams can
                  saturate network sockets.
                </td>
              </tr>
              <tr>
                <td>Main-Thread Rendering Load</td>
                <td>
                  Hundreds of tokens per second across multiple streams, written to IndexedDB, can briefly overload
                  browser rendering.
                </td>
              </tr>
              <tr>
                <td>Provider Queue Latency</td>
                <td>High-demand frontier models may experience server-side queue delays during peak usage hours.</td>
              </tr>
            </tbody>
          </table>
          <h3>How to Prevent and Resolve Lane Congestion</h3>
          <ol className="about-list ordered">
            <li>
              <strong>Diversify Your Athlete Roster (Multi-Provider):</strong> Mix providers across lanes (e.g., Google,
              Anthropic, OpenAI, Groq) to distribute API limits.
            </li>
            <li>
              <strong>Check Your Provider Account Tiers:</strong> Free-tier keys have strict concurrency caps; upgrading
              increases TPM/RPM thresholds.
            </li>
            <li>
              <strong>Reduce Concurrent Lanes:</strong> On mobile or low bandwidth, scale back from 6 lanes to 2–3.
            </li>
            <li>
              <strong>Lower Output Token Length:</strong> Shorter max output keeps streams open for less time.
            </li>
            <li>
              <strong>Enable Auto-Backoff / Staggered Start:</strong> When available in settings, staggered fan-out sends
              prompts in micro-intervals rather than all at once.
            </li>
          </ol>
        </section>
      ) : null}
    </article>
  );
}
