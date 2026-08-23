"use client";

import { useState } from "react";
import { PLAN_PRICING, type BillingCadence, type PlanId } from "@/lib/subscription";

function CheckoutButton({
  plan,
  cadence,
  email,
  label,
  className,
}: {
  plan: PlanId;
  cadence: BillingCadence;
  email?: string | null;
  label: string;
  className: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan, cadence, email: email ?? undefined }),
          })
            .then(async (response) => {
              const json = (await response.json()) as { ok?: boolean; url?: string; error?: string };
              if (json.url) {
                window.location.href = json.url;
                return;
              }
              throw new Error(json.error || "Checkout unavailable.");
            })
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Checkout failed.");
            })
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Opening…" : label}
      </button>
      {error ? <span className="hint flag-copy">{error}</span> : null}
    </>
  );
}

export function PricingPlans({
  email,
  compact = false,
}: {
  email?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "pricing-plans compact" : "pricing-plans"}>
      <article className="pricing-card">
        <p className="pricing-kicker">Single</p>
        <h3 className="pricing-title">Olympiad Single</h3>
        <p className="pricing-blurb">Single-mode chat. One UI + BYOK vault on this device.</p>
        <div className="pricing-options">
          <CheckoutButton
            plan="single"
            cadence="monthly"
            email={email}
            label={PLAN_PRICING.single.monthly.label}
            className="gold-btn"
          />
          <CheckoutButton
            plan="single"
            cadence="yearly"
            email={email}
            label={PLAN_PRICING.single.yearly.label}
            className="ghost-btn"
          />
        </div>
      </article>
      <article className="pricing-card">
        <p className="pricing-kicker">Compare</p>
        <h3 className="pricing-title">Olympiad Compare</h3>
        <p className="pricing-blurb">Compare mode + Podium with 2 lanes and Judge.</p>
        <div className="pricing-options">
          <CheckoutButton
            plan="compare"
            cadence="monthly"
            email={email}
            label={PLAN_PRICING.compare.monthly.label}
            className="gold-btn"
          />
          <CheckoutButton
            plan="compare"
            cadence="yearly"
            email={email}
            label={PLAN_PRICING.compare.yearly.label}
            className="ghost-btn"
          />
        </div>
      </article>
      <article className="pricing-card featured">
        <p className="pricing-kicker">Pro</p>
        <h3 className="pricing-title">Olympiad Pro</h3>
        <p className="pricing-blurb">All modes + 6-lane Podium + Judge and Coach routing.</p>
        <div className="pricing-options">
          <CheckoutButton
            plan="pro"
            cadence="monthly"
            email={email}
            label={PLAN_PRICING.pro.monthly.label}
            className="gold-btn"
          />
          <CheckoutButton
            plan="pro"
            cadence="yearly"
            email={email}
            label={PLAN_PRICING.pro.yearly.label}
            className="ghost-btn"
          />
        </div>
      </article>
    </div>
  );
}
