import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";
import type { BillingCadence, PlanId } from "@/lib/subscription";
import {
  checkoutCancelUrl,
  checkoutSuccessUrl,
  getStripe,
  stripeConfigured,
} from "@/lib/stripe-server";
import { priceIdForPlan, readStripePriceEnv } from "@/lib/stripe-config";

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return Response.json({ ok: false, error: "Stripe is not configured on this server." }, { status: 503 });
  }

  const stripe = getStripe();
  const prices = readStripePriceEnv();
  if (!stripe || !prices) {
    return Response.json({ ok: false, error: "Stripe prices are not configured." }, { status: 503 });
  }

  const body = (await request.json()) as {
    plan?: PlanId;
    cadence?: BillingCadence;
    email?: string;
  };

  const plan = body.plan;
  const cadence = body.cadence;
  if (!plan || !cadence || !["single", "compare", "pro"].includes(plan)) {
    return Response.json({ ok: false, error: "Plan and cadence are required." }, { status: 400 });
  }

  const priceId = priceIdForPlan(plan, cadence, prices);
  if (!priceId) {
    return Response.json({ ok: false, error: "Unknown plan." }, { status: 400 });
  }

  const session = await readSession();
  const signedInEmail = session ? getUserById(session.userId)?.email : null;
  const email = body.email?.trim() || signedInEmail || undefined;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: checkoutSuccessUrl(),
    cancel_url: checkoutCancelUrl(),
    customer_email: email,
    client_reference_id: session?.userId,
    metadata: {
      plan,
      cadence,
    },
    subscription_data: {
      metadata: {
        plan,
        cadence,
      },
    },
  });

  if (!checkout.url) {
    return Response.json({ ok: false, error: "Could not start checkout." }, { status: 500 });
  }

  return Response.json({ ok: true, url: checkout.url });
}
