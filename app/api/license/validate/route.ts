import { lemonErrorMessage, lemonRequest, toLicenseRecord, verifyLemonPayload } from "@/lib/lemon";
import { licenseUnlocksPremium } from "@/lib/license";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    licenseKey?: string;
    instanceId?: string;
    instanceName?: string;
  };
  const licenseKey = body.licenseKey?.trim() ?? "";
  if (!licenseKey) {
    return Response.json({ ok: false, error: "License key required." }, { status: 400 });
  }

  const params: Record<string, string> = { license_key: licenseKey };
  if (body.instanceId) params.instance_id = body.instanceId;

  const lemon = await lemonRequest("validate", params);
  if (lemon.error || lemon.valid === false) {
    return Response.json({
      ok: false,
      expired: lemon.license_key?.status === "expired",
      error: lemon.error || "License is no longer valid.",
      status: lemon.license_key?.status ?? "unknown",
    });
  }

  const { verification } = verifyLemonPayload(lemon);
  if (!verification.ok) {
    return Response.json(
      { ok: false, error: lemonErrorMessage(verification.reason) },
      { status: 403 },
    );
  }

  const record = toLicenseRecord(
    licenseKey,
    body.instanceName?.trim() || lemon.instance?.name || "AI Olympiad",
    lemon,
    verification.tier,
  );

  const premium = licenseUnlocksPremium(record.tier, record.status);
  return Response.json({
    ok: premium,
    record: premium
      ? record
      : { ...record, tier: record.tier === "lifetime" ? record.tier : "free" },
    expired: record.status === "expired" || record.status === "disabled",
  });
}
