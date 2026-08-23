/** Marketing + checkout helpers for Olympiad Single, Compare & Pro (Stripe). */

export const PRO_SUBSCRIPTION_TAGLINE =
  "One person · one vault · one UI — your API keys stay local on this device.";

export const PLAN_PRICING = {
  single: {
    monthly: { label: "$5/mo", cadence: "monthly" as const },
    yearly: { label: "$49/yr", cadence: "yearly" as const },
  },
  compare: {
    monthly: { label: "$7/mo", cadence: "monthly" as const },
    yearly: { label: "$75/yr", cadence: "yearly" as const },
  },
  pro: {
    monthly: { label: "$9/mo", cadence: "monthly" as const },
    yearly: { label: "$99/yr", cadence: "yearly" as const },
  },
} as const;

export type PlanId = keyof typeof PLAN_PRICING;
export type BillingCadence = "monthly" | "yearly";

export function getLifetimePriceLabel(): string | null {
  return process.env.NEXT_PUBLIC_LIFETIME_PRICE_LABEL?.trim() || null;
}

/** @deprecated Use PLAN_PRICING.pro.monthly.label */
export function getProPriceLabel(): string | null {
  return process.env.NEXT_PUBLIC_PRO_PRICE_LABEL?.trim() || PLAN_PRICING.pro.monthly.label;
}
