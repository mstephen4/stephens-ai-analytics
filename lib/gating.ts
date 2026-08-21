import { licenseUnlocksPremium } from "./license";
import type { LicenseRecord, LicenseTier } from "./types";

export type PaywallFeature = "coach" | "podium" | "compare";

export interface FeatureAccess {
  pro: boolean;
  single: boolean;
}

export function isPremiumActive(record: LicenseRecord | null): boolean {
  if (!record) return false;
  return licenseUnlocksPremium(record.tier, record.status);
}

export function featureLocked(feature: PaywallFeature, access: FeatureAccess): boolean {
  if (feature === "podium" || feature === "coach") return !access.pro;
  if (feature === "compare") return !access.single;
  return true;
}

export function degradeToFree(record: LicenseRecord): LicenseRecord {
  return {
    ...record,
    tier:
      record.tier === "lifetime" && record.status !== "disabled"
        ? "lifetime"
        : record.tier === "single" && record.status !== "disabled"
          ? "single"
          : "free",
    status: record.status === "expired" || record.status === "disabled" ? record.status : "expired",
  };
}

export function displayTier(tier: LicenseTier, access: FeatureAccess): string {
  if (access.pro) {
    if (tier === "lifetime") return "Lifetime Pass";
    return "Olympiad Pro";
  }
  if (access.single) return "Olympiad Single";
  return "Free Player";
}
