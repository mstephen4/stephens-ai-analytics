"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRO_SUBSCRIPTION_TAGLINE } from "@/lib/subscription";
import { PricingPlans } from "@/components/arena/PricingPlans";
import { SiteHeader } from "@/components/site/SiteHeader";

export function PricingPageContent() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then(async (response) => {
        const json = (await response.json()) as { email?: string | null; signedIn?: boolean };
        if (json.signedIn && json.email) setEmail(json.email);
      })
      .catch(() => {
        // checkout works without a signed-in email
      });
  }, []);

  return (
    <div className="pricing-page">
      <SiteHeader current="pricing" />
      <main className="pricing-page-main">
        <header className="pricing-page-hero">
          <p className="brand-kicker">OLYMPIC PASS</p>
          <h1>Choose your plan</h1>
          <p>{PRO_SUBSCRIPTION_TAGLINE}</p>
          <p className="pricing-page-lede">
            Subscribe with Stripe first — no API keys required at checkout. After payment, sign in on{" "}
            <Link href="/events">Events</Link> with the same email, then add keys in the Vault when you&apos;re ready to
            chat.
          </p>
        </header>
        <PricingPlans email={email} />
        <div className="pricing-page-foot">
          <p className="hint">
            Plans unlock features only. You still bring your own API keys and pay providers directly.
          </p>
          <div className="pricing-page-actions">
            <Link href="/events?trial=1" className="ghost-btn">
              Prefer a free Pro trial?
            </Link>
            <Link href="/events" className="gold-btn">
              Enter the arena
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
