import { licenseUnlocksPremium } from "./license";
import type { LicenseRecord, LicenseTier } from "./types";

/** App modes that require a paid plan or active trial (Single, Compare, Podium). */
export type AppModeFeature = "single" | "compare" | "podium";

export type PaywallFeature = AppModeFeature | "coach";

export interface FeatureAccess {
  /** Paid Single/Pro/Lifetime or active trial — unlocks all three chat modes + vault UI. */
  subscribed: boolean;
  /** Pro, Lifetime, or trial — unlocks Coach. */
  pro: boolean;
}

export function isPremiumActive(record: LicenseRecord | null): boolean {
  if (!record) return false;
  return licenseUnlocksPremium(record.tier, record.status);
}

export function featureLocked(feature: PaywallFeature, access: FeatureAccess): boolean {
  if (feature === "coach") return !access.pro;
  return !access.subscribed;
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
  if (access.subscribed) return "Olympiad Single";
  return "Free Player";
}
