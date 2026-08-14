import { readLicenseEnv, verifyArenaLicense } from "./license";
import type { LemonLicenseResponse, LicenseRecord, LicenseStatus } from "./types";

const LEMON_LICENSE_URL = "https://api.lemonsqueezy.com/v1/licenses";

export function lemonErrorMessage(reason?: string): string {
  switch (reason) {
    case "unconfigured":
      return "Lemon Squeezy product IDs are not configured on this server.";
    case "wrong_store":
      return "This license belongs to a different Lemon Squeezy store.";
    case "wrong_product":
      return "This license is not an Arena product key.";
    case "wrong_variant":
      return "This license variant is not Arena Pro or Lifetime.";
    default:
      return "License could not be verified.";
  }
}

export async function lemonRequest(
  action: "activate" | "validate" | "deactivate",
  params: Record<string, string>,
): Promise<LemonLicenseResponse> {
  const body = new URLSearchParams(params);
  const response = await fetch(`${LEMON_LICENSE_URL}/${action}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const json = (await response.json()) as LemonLicenseResponse;
  if (!response.ok && !json.error) {
    json.error = `Lemon Squeezy returned ${response.status}`;
  }
  return json;
}

export function toLicenseRecord(
  licenseKey: string,
  instanceName: string,
  lemon: LemonLicenseResponse,
  tier: LicenseRecord["tier"],
): LicenseRecord {
  const status = (lemon.license_key?.status ?? "unknown") as LicenseStatus;
  return {
    licenseKey,
    instanceId: lemon.instance?.id ?? "",
    instanceName,
    tier,
    status,
    productId: lemon.meta?.product_id,
    variantId: lemon.meta?.variant_id,
    lastValidatedAt: Date.now(),
    expiresAt: lemon.license_key?.expires_at ?? null,
  };
}

export function verifyLemonPayload(lemon: LemonLicenseResponse) {
  const env = readLicenseEnv();
  const verification = verifyArenaLicense(lemon.meta, env);
  return { env, verification };
}
