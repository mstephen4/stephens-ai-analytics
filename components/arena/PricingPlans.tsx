"use client";

import { getCheckoutUrl, getLifetimeCheckoutUrl, getLifetimePriceLabel, PLAN_PRICING } from "@/lib/subscription";

export function PricingPlans({
  email,
  compact = false,
}: {
  email?: string | null;
  compact?: boolean;
}) {
  const lifetimeUrl = getLifetimeCheckoutUrl(email);
  const lifetimePrice = getLifetimePriceLabel();

  return (
    <div className={compact ? "pricing-plans compact" : "pricing-plans"}>
      <article className="pricing-card">
        <p className="pricing-kicker">Single</p>
        <h3 className="pricing-title">Olympiad Single</h3>
        <p className="pricing-blurb">Single, Compare, and Podium (3 lanes). One UI + BYOK vault on this device.</p>
        <div className="pricing-options">
          {getCheckoutUrl("single", "monthly", email) ? (
            <a className="gold-btn" href={getCheckoutUrl("single", "monthly", email)}>
              {PLAN_PRICING.single.monthly.label}
            </a>
          ) : (
            <span className="pricing-unconfigured">{PLAN_PRICING.single.monthly.label}</span>
          )}
          {getCheckoutUrl("single", "yearly", email) ? (
            <a className="ghost-btn" href={getCheckoutUrl("single", "yearly", email)}>
              {PLAN_PRICING.single.yearly.label}
            </a>
          ) : (
            <span className="pricing-unconfigured">{PLAN_PRICING.single.yearly.label}</span>
          )}
        </div>
      </article>
      <article className="pricing-card featured">
        <p className="pricing-kicker">Pro</p>
        <h3 className="pricing-title">Olympiad Pro</h3>
        <p className="pricing-blurb">Everything in Single, plus 6-lane Podium + Judge and Coach routing.</p>
        <div className="pricing-options">
          {getCheckoutUrl("pro", "monthly", email) ? (
            <a className="gold-btn" href={getCheckoutUrl("pro", "monthly", email)}>
              {PLAN_PRICING.pro.monthly.label}
            </a>
          ) : (
            <span className="pricing-unconfigured">{PLAN_PRICING.pro.monthly.label}</span>
          )}
          {getCheckoutUrl("pro", "yearly", email) ? (
            <a className="ghost-btn" href={getCheckoutUrl("pro", "yearly", email)}>
              {PLAN_PRICING.pro.yearly.label}
            </a>
          ) : (
            <span className="pricing-unconfigured">{PLAN_PRICING.pro.yearly.label}</span>
          )}
        </div>
      </article>
      {lifetimeUrl ? (
        <article className="pricing-card">
          <p className="pricing-kicker">Lifetime</p>
          <h3 className="pricing-title">Lifetime Pass</h3>
          <p className="pricing-blurb">Pro features forever — one payment, no renewal.</p>
          <a className="ghost-btn" href={lifetimeUrl}>
            {lifetimePrice ? `Lifetime — ${lifetimePrice}` : "Buy lifetime"}
          </a>
        </article>
      ) : null}
    </div>
  );
}
