import { readSession } from "@/lib/auth/session";
import { getLicenseByEmail, getUserById } from "@/lib/auth/users";
import { billingPortalReturnUrl, getStripe, stripeConfigured } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST() {
  if (!stripeConfigured()) {
    return Response.json({ ok: false, error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return Response.json({ ok: false, error: "Stripe is not configured." }, { status: 503 });
  }

  const session = await readSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const user = getUserById(session.userId);
  if (!user?.email) {
    return Response.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  const linked = getLicenseByEmail(user.email);
  if (!linked?.license_key || linked.license_key.startsWith("lifetime_")) {
    return Response.json({ ok: false, error: "No active Stripe subscription for this account." }, { status: 404 });
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(linked.license_key);
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (!customerId) {
      return Response.json({ ok: false, error: "Subscription customer not found." }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: billingPortalReturnUrl(),
    });

    return Response.json({ ok: true, url: portal.url });
  } catch {
    return Response.json({ ok: false, error: "Could not open billing portal." }, { status: 500 });
  }
}
