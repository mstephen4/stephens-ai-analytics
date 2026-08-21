import type { LemonLicenseMeta, LicenseTier } from "./types";

export interface LicenseEnv {
  storeId: string;
  productId: string;
  singleMonthlyVariantId: string;
  singleYearlyVariantId: string;
  proMonthlyVariantId: string;
  proYearlyVariantId: string;
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
  const singleMonthlyVariantId = env.LEMONSQUEEZY_SINGLE_MONTHLY_VARIANT_ID?.trim() ?? "";
  const singleYearlyVariantId = env.LEMONSQUEEZY_SINGLE_YEARLY_VARIANT_ID?.trim() ?? "";
  const proMonthlyVariantId =
    env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID?.trim() ||
    env.LEMONSQUEEZY_PRO_VARIANT_ID?.trim() ||
    "";
  const proYearlyVariantId = env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID?.trim() ?? "";
  const lifetimeVariantId = env.LEMONSQUEEZY_LIFETIME_VARIANT_ID?.trim() ?? "";
  if (
    !storeId ||
    !productId ||
    !singleMonthlyVariantId ||
    !singleYearlyVariantId ||
    !proMonthlyVariantId ||
    !proYearlyVariantId ||
    !lifetimeVariantId
  ) {
    return null;
  }
  return {
    storeId,
    productId,
    singleMonthlyVariantId,
    singleYearlyVariantId,
    proMonthlyVariantId,
    proYearlyVariantId,
    lifetimeVariantId,
  };
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
  const variantId = String(meta.variant_id);
  if (variantId === env.lifetimeVariantId) {
    return { ok: true, tier: "lifetime" };
  }
  if (variantId === env.proMonthlyVariantId || variantId === env.proYearlyVariantId) {
    return { ok: true, tier: "pro" };
  }
  if (variantId === env.singleMonthlyVariantId || variantId === env.singleYearlyVariantId) {
    return { ok: true, tier: "single" };
  }
  return { ok: false, tier: "free", reason: "wrong_variant" };
}

export function isPaidTier(tier: LicenseTier): boolean {
  return tier === "single" || tier === "pro" || tier === "lifetime";
}

export function licenseUnlocksPremium(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  if (tier !== "pro" && tier !== "lifetime") return false;
  if (tier === "lifetime") {
    return status !== "disabled" && status !== "expired";
  }
  return status === "active" || status === "inactive";
}

export function licenseUnlocksSingle(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  if (tier === "lifetime") {
    return status !== "disabled" && status !== "expired";
  }
  if (tier === "pro") {
    return licenseUnlocksPremium(tier, status);
  }
  if (tier === "single") {
    return status === "active" || status === "inactive";
  }
  return false;
}
