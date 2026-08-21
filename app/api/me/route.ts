import { readSession } from "@/lib/auth/session";
import { getUserById, linkUserLicense, upsertLicenseByEmail } from "@/lib/auth/users";
import { lemonErrorMessage, lemonRequest, toLicenseRecord, verifyLemonPayload } from "@/lib/lemon";
import { licenseUnlocksPremium } from "@/lib/license";
import { resolvePremiumForUser } from "@/lib/premium-server";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return Response.json({
      signedIn: false,
      email: null,
      premium: false,
      subscribed: false,
      source: null,
      tier: "free",
      trialEndsAt: null,
    });
  }

  const user = getUserById(session.userId);
  const status = await resolvePremiumForUser(session.userId, null);

  return Response.json({
    signedIn: true,
    email: user?.email ?? session.email,
    premium: status.premium,
    subscribed: status.subscribed,
    source: status.source,
    tier: status.tier,
    trialEndsAt: status.trialEndsAt,
  });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as { licenseKey?: string; instanceName?: string };
  const licenseKey = body.licenseKey?.trim() ?? "";
  const instanceName = body.instanceName?.trim() || "AI Olympiad";
  if (!licenseKey) {
    return Response.json({ ok: false, error: "License key required." }, { status: 400 });
  }

  const lemon = await lemonRequest("activate", { license_key: licenseKey, instance_name: instanceName });
  if (lemon.error || lemon.activated === false) {
    return Response.json({ ok: false, error: lemon.error || "Activation failed." }, { status: 400 });
  }

  const { verification } = verifyLemonPayload(lemon);
  if (!verification.ok) {
    return Response.json({ ok: false, error: lemonErrorMessage(verification.reason) }, { status: 403 });
  }

  const record = toLicenseRecord(licenseKey, instanceName, lemon, verification.tier);
  if (!licenseUnlocksPremium(record.tier, record.status)) {
    return Response.json({ ok: false, error: "This license is not active.", record }, { status: 402 });
  }

  const user = getUserById(session.userId);
  if (user) {
    upsertLicenseByEmail(user.email, licenseKey, record.tier, record.status);
    linkUserLicense(user.id, licenseKey, record.instanceId);
  }

  const status = await resolvePremiumForUser(session.userId, record);

  return Response.json({
    ok: true,
    record,
    premium: status.premium,
    source: status.source,
    tier: status.tier,
  });
}
