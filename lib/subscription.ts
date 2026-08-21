/** Marketing + checkout helpers for the single-user Olympiad Pro subscription (Lemon Squeezy). */

export const PRO_SUBSCRIPTION_TAGLINE =
  "One person · one vault · one UI — Pro unlocks Podium & Coach while your API keys stay local.";

export function getProPriceLabel(): string | null {
  const label = process.env.NEXT_PUBLIC_PRO_PRICE_LABEL?.trim();
  return label || null;
}

export function getLifetimePriceLabel(): string | null {
  const label = process.env.NEXT_PUBLIC_LIFETIME_PRICE_LABEL?.trim();
  return label || null;
}

export function getProCheckoutUrl(email?: string | null): string {
  const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO?.trim() ?? "";
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

export function getSubscriptionPortalUrl(): string {
  return process.env.NEXT_PUBLIC_LEMONSQUEEZY_CUSTOMER_PORTAL?.trim() ?? "";
}
