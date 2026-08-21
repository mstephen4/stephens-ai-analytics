/** Marketing + checkout helpers for Olympiad Single, Compare & Pro (Lemon Squeezy). */

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

function rawCheckoutUrl(plan: PlanId, cadence: BillingCadence): string {
  if (plan === "single" && cadence === "monthly") {
    return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_SINGLE_MONTHLY?.trim() ?? "";
  }
  if (plan === "single" && cadence === "yearly") {
    return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_SINGLE_YEARLY?.trim() ?? "";
  }
  if (plan === "compare" && cadence === "monthly") {
    return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_COMPARE_MONTHLY?.trim() ?? "";
  }
  if (plan === "compare" && cadence === "yearly") {
    return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_COMPARE_YEARLY?.trim() ?? "";
  }
  if (plan === "pro" && cadence === "monthly") {
    return (
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO_MONTHLY?.trim() ||
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO?.trim() ||
      ""
    );
  }
  if (plan === "pro" && cadence === "yearly") {
    return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO_YEARLY?.trim() ?? "";
  }
  return "";
}

export function getCheckoutUrl(plan: PlanId, cadence: BillingCadence, email?: string | null): string {
  const base = rawCheckoutUrl(plan, cadence);
  if (!base) return "";
  if (!email?.trim()) return base;
  try {
    const url = new URL(base);
    url.searchParams.set("checkout[email]", email.trim());
    return url.toString();
  } catch {
    return base;
  }
}

export function getLifetimeCheckoutUrl(email?: string | null): string {
  const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_LIFETIME?.trim() ?? "";
  if (!base) return "";
  if (!email?.trim()) return base;
  try {
    const url = new URL(base);
    url.searchParams.set("checkout[email]", email.trim());
    return url.toString();
  } catch {
    return base;
  }
}

export function getLifetimePriceLabel(): string | null {
  return process.env.NEXT_PUBLIC_LIFETIME_PRICE_LABEL?.trim() || null;
}

export function getSubscriptionPortalUrl(): string {
  return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CUSTOMER_PORTAL?.trim() ?? "";
}

/** @deprecated Use PLAN_PRICING.pro.monthly.label */
export function getProPriceLabel(): string | null {
  return process.env.NEXT_PUBLIC_PRO_PRICE_LABEL?.trim() || PLAN_PRICING.pro.monthly.label;
}

/** @deprecated Use getCheckoutUrl("pro", "monthly") */
export function getProCheckoutUrl(email?: string | null): string {
  return getCheckoutUrl("pro", "monthly", email);
}
