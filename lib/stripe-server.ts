import "server-only";
import Stripe from "stripe";
import { upsertLicenseByEmail } from "./auth/users";
import { appBaseUrl } from "./app-url";
import {
  mapStripeSubscriptionStatus,
  pickBestStripeLicense,
  readStripePriceEnv,
  tierFromPriceId,
  type StripeLicenseRecord,
} from "./stripe-config";
import type { LicenseTier } from "./types";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secret);
  }
  return stripeClient;
}

export function stripeConfigured(): boolean {
  return Boolean(getStripe() && readStripePriceEnv());
}

function primaryPriceId(subscription: Stripe.Subscription): string | null {
  return subscription.items.data[0]?.price?.id ?? null;
}

export async function syncSubscriptionRecord(
  subscription: Stripe.Subscription,
  emailHint?: string | null,
): Promise<void> {
  const prices = readStripePriceEnv();
  if (!prices) return;

  const priceId = primaryPriceId(subscription);
  if (!priceId) return;

  const tier = tierFromPriceId(priceId, prices);
  if (!tier) return;

  let email = emailHint?.trim().toLowerCase() ?? "";
  if (!email) {
    const stripe = getStripe();
    if (!stripe) return;
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (!customerId) return;
    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) return;
    email = customer.email?.trim().toLowerCase() ?? "";
  }
  if (!email) return;

  upsertLicenseByEmail(
    email,
    subscription.id,
    tier,
    mapStripeSubscriptionStatus(subscription.status),
  );
}

export async function syncCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  const email =
    session.customer_details?.email?.trim().toLowerCase() ||
    session.customer_email?.trim().toLowerCase() ||
    null;

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscriptionRecord(subscription, email);
    return;
  }

  if (session.mode === "payment" && session.line_items) {
    const prices = readStripePriceEnv();
    if (!prices?.lifetime || !email) return;
    const expanded = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });
    const priceId = expanded.line_items?.data[0]?.price?.id;
    if (priceId !== prices.lifetime) return;
    upsertLicenseByEmail(email, `lifetime_${session.id}`, "lifetime", "active");
  }
}

export function checkoutSuccessUrl(): string {
  return `${appBaseUrl()}/events?checkout=success`;
}

export function checkoutCancelUrl(): string {
  return `${appBaseUrl()}/events?checkout=cancel`;
}

export function billingPortalReturnUrl(): string {
  return `${appBaseUrl()}/events`;
}

const STRIPE_LICENSE_CACHE_TTL_MS = 5 * 60 * 1000;
const stripeLicenseCache = new Map<
  string,
  { record: StripeLicenseRecord | null; expiresAt: number }
>();

function readCachedStripeLicense(email: string): StripeLicenseRecord | null | undefined {
  const cached = stripeLicenseCache.get(email);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    stripeLicenseCache.delete(email);
    return undefined;
  }
  return cached.record;
}

function writeCachedStripeLicense(email: string, record: StripeLicenseRecord | null) {
  stripeLicenseCache.set(email, {
    record,
    expiresAt: Date.now() + STRIPE_LICENSE_CACHE_TTL_MS,
  });
}

/** Resolve paid access from Stripe when local SQLite is empty (e.g. Vercel serverless). */
export async function lookupAndSyncLicenseByEmail(
  email: string,
): Promise<StripeLicenseRecord | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const cached = readCachedStripeLicense(normalized);
  if (cached !== undefined) return cached;

  const stripe = getStripe();
  const prices = readStripePriceEnv();
  if (!stripe || !prices) {
    writeCachedStripeLicense(normalized, null);
    return null;
  }

  const candidates: StripeLicenseRecord[] = [];
  let startingAfter: string | undefined;

  do {
    const page = await stripe.customers.list({
      email: normalized,
      limit: 100,
      starting_after: startingAfter,
    });

    for (const customer of page.data) {
      if ("deleted" in customer && customer.deleted) continue;

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 20,
        status: "all",
      });

      for (const subscription of subscriptions.data) {
        const priceId = primaryPriceId(subscription);
        if (!priceId) continue;

        const tier = tierFromPriceId(priceId, prices);
        if (!tier) continue;

        candidates.push({
          licenseKey: subscription.id,
          tier,
          status: mapStripeSubscriptionStatus(subscription.status),
          customerId: customer.id,
        });
      }
    }

    if (!page.has_more) break;
    startingAfter = page.data.at(-1)?.id;
  } while (startingAfter);

  const best = pickBestStripeLicense(candidates);
  if (best) {
    upsertLicenseByEmail(normalized, best.licenseKey, best.tier, best.status);
  }

  writeCachedStripeLicense(normalized, best);
  return best;
}

export async function lookupStripeCustomerIdByEmail(email: string): Promise<string | null> {
  const linked = await lookupAndSyncLicenseByEmail(email);
  return linked?.customerId ?? null;
}

export function tierLabel(tier: LicenseTier): string {
  switch (tier) {
    case "single":
      return "Olympiad Single";
    case "compare":
      return "Olympiad Compare";
    case "pro":
      return "Olympiad Pro";
    case "lifetime":
      return "Lifetime Pass";
    default:
      return "Free Player";
  }
}
