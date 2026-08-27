import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy — ${PRODUCT_NAME}`,
  description: `Privacy Policy for ${PRODUCT_NAME}.`,
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <SiteHeader />
      <main className="legal-page-main">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: August 27, 2026</p>

        <section>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Email address</strong> — for magic-link sign-in, subscription identity, and support.
            </li>
            <li>
              <strong>Payment metadata</strong> — Stripe handles card data; we receive subscription status tied to your
              email.
            </li>
            <li>
              <strong>Support messages</strong> — if you use the in-app support chat or escalate to a human.
            </li>
          </ul>
        </section>

        <section>
          <h2>What stays on your device</h2>
          <ul>
            <li>API keys (Vault)</li>
            <li>Chat history and events (IndexedDB)</li>
            <li>Local settings and preferences</li>
          </ul>
          <p>We do not sync your keys or chat logs to our servers.</p>
        </section>

        <section>
          <h2>How keys are used</h2>
          <p>
            When you send a prompt, your browser forwards requests through our edge API to your chosen provider using
            your keys. We do not persist prompts or responses on our servers beyond transient processing.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use a session cookie for sign-in (<code>olympiad_session</code>). No third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            Sign out to clear your session cookie. Clear site data in your browser to remove local vault and history.
            For account or billing questions, contact us via support or see{" "}
            <Link href="/terms">Terms</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
