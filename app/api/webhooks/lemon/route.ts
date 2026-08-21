import { createHmac, timingSafeEqual } from "node:crypto";
import { upsertLicenseByEmail } from "@/lib/auth/users";
import { readLicenseEnv } from "@/lib/license";
import type { LicenseTier } from "@/lib/types";

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

function tierFromVariantId(variantId: string, env: ReturnType<typeof readLicenseEnv>): LicenseTier {
  if (!env) return "pro";
  if (variantId === env.lifetimeVariantId) return "lifetime";
  if (variantId === env.proMonthlyVariantId || variantId === env.proYearlyVariantId) return "pro";
  if (variantId === env.singleMonthlyVariantId || variantId === env.singleYearlyVariantId) return "single";
  return "pro";
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
        variant_id?: number;
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
  const variantId = String(attrs.variant_id ?? "");
  const tier = tierFromVariantId(variantId, env);

  if (email && licenseKey && (event.includes("license") || event.includes("order") || event.includes("subscription"))) {
    upsertLicenseByEmail(email, licenseKey, tier, attrs.status ?? "active");
  }

  return Response.json({ ok: true });
}
