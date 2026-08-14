import type { LemonLicenseMeta, LicenseTier } from "./types";

export interface LicenseEnv {
  storeId: string;
  productId: string;
  proVariantId: string;
  lifetimeVariantId: string;
}

export type LicenseGateReason =
  | "unconfigured"
  | "wrong_store"
  | "wrong_product"
  | "wrong_variant";

export interface LicenseVerification {
  ok: boolean;
  tier: LicenseTier;
  reason?: LicenseGateReason;
}

export function readLicenseEnv(
  env: NodeJS.ProcessEnv = process.env,
): LicenseEnv | null {
  const storeId = env.LEMONSQUEEZY_STORE_ID?.trim() ?? "";
  const productId = env.LEMONSQUEEZY_PRODUCT_ID?.trim() ?? "";
  const proVariantId = env.LEMONSQUEEZY_PRO_VARIANT_ID?.trim() ?? "";
  const lifetimeVariantId = env.LEMONSQUEEZY_LIFETIME_VARIANT_ID?.trim() ?? "";
  if (!storeId || !productId || !proVariantId || !lifetimeVariantId) return null;
  return { storeId, productId, proVariantId, lifetimeVariantId };
}

export function verifyArenaLicense(
  meta: LemonLicenseMeta | undefined,
  env: LicenseEnv | null,
): LicenseVerification {
  if (!env) {
    return { ok: false, tier: "free", reason: "unconfigured" };
  }
  if (!meta) {
    return { ok: false, tier: "free", reason: "wrong_product" };
  }
  if (String(meta.store_id) !== env.storeId) {
    return { ok: false, tier: "free", reason: "wrong_store" };
  }
  if (String(meta.product_id) !== env.productId) {
    return { ok: false, tier: "free", reason: "wrong_product" };
  }
  if (String(meta.variant_id) === env.lifetimeVariantId) {
    return { ok: true, tier: "lifetime" };
  }
  if (String(meta.variant_id) === env.proVariantId) {
    return { ok: true, tier: "pro" };
  }
  return { ok: false, tier: "free", reason: "wrong_variant" };
}

export function isPaidTier(tier: LicenseTier): boolean {
  return tier === "pro" || tier === "lifetime";
}

export function licenseUnlocksPremium(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  if (!isPaidTier(tier)) return false;
  if (tier === "lifetime") {
    return status !== "disabled" && status !== "expired";
  }
  return status === "active" || status === "inactive";
}
