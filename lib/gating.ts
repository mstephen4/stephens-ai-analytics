import { licenseUnlocksPremium } from "./license";
import type { LicenseRecord, LicenseTier } from "./types";

export type PaywallFeature = "coach" | "podium";

export function isPremiumActive(record: LicenseRecord | null): boolean {
  if (!record) return false;
  return licenseUnlocksPremium(record.tier, record.status);
}

export function featureLocked(
  feature: PaywallFeature,
  premium: boolean,
): boolean {
  void feature;
  return !premium;
}

export function degradeToFree(record: LicenseRecord): LicenseRecord {
  return {
    ...record,
    tier: record.tier === "lifetime" && record.status !== "disabled" ? "lifetime" : "free",
    status: record.status === "expired" || record.status === "disabled" ? record.status : "expired",
  };
}

export function displayTier(tier: LicenseTier, premium: boolean): string {
  if (!premium) return "Free Player";
  if (tier === "lifetime") return "Lifetime Pass";
  if (tier === "pro") return "Olympiad Pro";
  return "Free Player";
}
