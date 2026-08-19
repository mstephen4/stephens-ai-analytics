import { createHmac, timingSafeEqual } from "node:crypto";
import { upsertLicenseByEmail } from "@/lib/auth/users";
import { readLicenseEnv } from "@/lib/license";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  if (!verifySignature(rawBody, signature)) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: {
    meta?: { event_name?: string };
    data?: {
      attributes?: {
        user_email?: string;
        customer_email?: string;
        key?: string;
        status?: string;
      };
      relationships?: Record<string, unknown>;
    };
  };

  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = payload.meta?.event_name ?? "";
  const attrs = payload.data?.attributes ?? {};
  const email = (attrs.user_email || attrs.customer_email || "").trim().toLowerCase();
  const licenseKey = attrs.key?.trim() ?? "";

  const env = readLicenseEnv();
  const variantId = String(
    (payload.data as { attributes?: { variant_id?: number } })?.attributes?.variant_id ?? "",
  );
  let tier: "pro" | "lifetime" = "pro";
  if (env?.lifetimeVariantId && variantId === env.lifetimeVariantId) tier = "lifetime";

  if (email && licenseKey && (event.includes("license") || event.includes("order") || event.includes("subscription"))) {
    upsertLicenseByEmail(email, licenseKey, tier, attrs.status ?? "active");
  }

  return Response.json({ ok: true });
}
