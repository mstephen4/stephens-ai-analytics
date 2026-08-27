import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service — ${PRODUCT_NAME}`,
  description: `Terms of Service for ${PRODUCT_NAME}.`,
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <SiteHeader />
      <main className="legal-page-main">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: August 27, 2026</p>

        <section>
          <h2>1. Service</h2>
          <p>
            AI Olympiad (&quot;we,&quot; &quot;the Service&quot;) provides a browser-based interface for comparing AI
            models using your own API keys (BYOK). We sell subscription access to features — not model credits.
          </p>
        </section>

        <section>
          <h2>2. Accounts &amp; billing</h2>
          <p>
            Subscriptions are tied to your email and processed by Stripe. You are responsible for charges from your AI
            providers separately. Refund requests are handled according to Stripe and our support policy.
          </p>
        </section>

        <section>
          <h2>3. Acceptable use</h2>
          <p>
            You agree not to misuse the Service, attempt unauthorized access, or use it for unlawful content generation.
            You are responsible for compliance with your AI providers&apos; terms.
          </p>
        </section>

        <section>
          <h2>4. Disclaimers</h2>
          <p>
            AI outputs may be inaccurate or incomplete. The Service is provided &quot;as is&quot; without warranties.
            We are not liable for decisions made based on model outputs or for provider outages, rate limits, or costs
            incurred through your API keys.
          </p>
        </section>

        <section>
          <h2>5. Contact</h2>
          <p>
            Questions: use the support chat on the site or email the address listed on{" "}
            <Link href="/about">About</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
