import "server-only";
import Stripe from "stripe";
import { upsertLicenseByEmail } from "./auth/users";
import {
  appBaseUrl,
  mapStripeSubscriptionStatus,
  readStripePriceEnv,
  tierFromPriceId,
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
