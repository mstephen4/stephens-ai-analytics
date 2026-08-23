import type { LicenseTier } from "./types";
import type { BillingCadence, PlanId } from "./subscription";

export interface StripePriceEnv {
  singleMonthly: string;
  singleYearly: string;
  compareMonthly: string;
  compareYearly: string;
  proMonthly: string;
  proYearly: string;
  lifetime?: string;
}

export function readStripePriceEnv(env: Record<string, string | undefined> = process.env): StripePriceEnv | null {
  const singleMonthly = env.STRIPE_PRICE_SINGLE_MONTHLY?.trim() ?? "";
  const singleYearly = env.STRIPE_PRICE_SINGLE_YEARLY?.trim() ?? "";
  const compareMonthly = env.STRIPE_PRICE_COMPARE_MONTHLY?.trim() ?? "";
  const compareYearly = env.STRIPE_PRICE_COMPARE_YEARLY?.trim() ?? "";
  const proMonthly = env.STRIPE_PRICE_PRO_MONTHLY?.trim() ?? "";
  const proYearly = env.STRIPE_PRICE_PRO_YEARLY?.trim() ?? "";
  const lifetime = env.STRIPE_PRICE_LIFETIME?.trim() ?? "";

  if (
    !singleMonthly ||
    !singleYearly ||
    !compareMonthly ||
    !compareYearly ||
    !proMonthly ||
    !proYearly
  ) {
    return null;
  }

  return {
    singleMonthly,
    singleYearly,
    compareMonthly,
    compareYearly,
    proMonthly,
    proYearly,
    lifetime: lifetime || undefined,
  };
}

export function priceIdForPlan(
  plan: PlanId,
  cadence: BillingCadence,
  prices: StripePriceEnv,
): string | null {
  if (plan === "single" && cadence === "monthly") return prices.singleMonthly;
  if (plan === "single" && cadence === "yearly") return prices.singleYearly;
  if (plan === "compare" && cadence === "monthly") return prices.compareMonthly;
  if (plan === "compare" && cadence === "yearly") return prices.compareYearly;
  if (plan === "pro" && cadence === "monthly") return prices.proMonthly;
  if (plan === "pro" && cadence === "yearly") return prices.proYearly;
  return null;
}

export function tierFromPriceId(priceId: string, prices: StripePriceEnv): LicenseTier | null {
  if (prices.lifetime && priceId === prices.lifetime) return "lifetime";
  if (priceId === prices.proMonthly || priceId === prices.proYearly) return "pro";
  if (priceId === prices.compareMonthly || priceId === prices.compareYearly) return "compare";
  if (priceId === prices.singleMonthly || priceId === prices.singleYearly) return "single";
  return null;
}

export function mapStripeSubscriptionStatus(status: string): "active" | "expired" | "disabled" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled" || status === "incomplete_expired" || status === "unpaid") return "expired";
  return "disabled";
}

export function appBaseUrl(env: Record<string, string | undefined> = process.env): string {
  return env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}
