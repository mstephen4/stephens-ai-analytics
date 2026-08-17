import { lemonErrorMessage, lemonRequest, toLicenseRecord, verifyLemonPayload } from "@/lib/lemon";
import { licenseUnlocksPremium } from "@/lib/license";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { licenseKey?: string; instanceName?: string };
  const licenseKey = body.licenseKey?.trim() ?? "";
  const instanceName = body.instanceName?.trim() || "AI Olympiad";
  if (!licenseKey) {
    return Response.json({ ok: false, error: "License key required." }, { status: 400 });
  }

  const lemon = await lemonRequest("activate", {
    license_key: licenseKey,
    instance_name: instanceName,
  });

  if (lemon.error || lemon.activated === false) {
    return Response.json(
      { ok: false, error: lemon.error || "Activation failed." },
      { status: 400 },
    );
  }

  const { verification } = verifyLemonPayload(lemon);
  if (!verification.ok) {
    return Response.json(
      { ok: false, error: lemonErrorMessage(verification.reason) },
      { status: 403 },
    );
  }

  const record = toLicenseRecord(licenseKey, instanceName, lemon, verification.tier);
  if (!licenseUnlocksPremium(record.tier, record.status)) {
    return Response.json(
      {
        ok: false,
        error: "This license is not active. Subscription may have expired.",
        record,
      },
      { status: 402 },
    );
  }

  return Response.json({ ok: true, record });
}
