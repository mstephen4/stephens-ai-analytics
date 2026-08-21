import { COMPARE_PODIUM_MAX_LANES, PRO_PODIUM_MAX_LANES } from "./constants";
import { licenseUnlocksPremium } from "./license";
import type { LicenseRecord, LicenseTier } from "./types";

export type AppModeFeature = "single" | "compare" | "podium";

export type PaywallFeature = AppModeFeature | "coach";

export interface FeatureAccess {
  tier: LicenseTier;
  /** Pro, Lifetime, or trial — unlocks Coach and 6-lane Podium. */
  pro: boolean;
}

export function isPremiumActive(record: LicenseRecord | null): boolean {
  if (!record) return false;
  return licenseUnlocksPremium(record.tier, record.status);
}

export function featureLocked(feature: PaywallFeature, access: FeatureAccess): boolean {
  if (feature === "coach") return !access.pro;
  if (feature === "single") return access.tier === "free";
  if (feature === "compare" || feature === "podium") {
    return access.tier === "free" || access.tier === "single";
  }
  return true;
}

export function maxPodiumLanes(access: FeatureAccess): number {
  if (access.pro || access.tier === "pro" || access.tier === "lifetime") {
    return PRO_PODIUM_MAX_LANES;
  }
  if (access.tier === "compare") return COMPARE_PODIUM_MAX_LANES;
  return 0;
}

export function visiblePodiumLanes(access: FeatureAccess, configuredCount: number): number {
  const max = maxPodiumLanes(access);
  if (max === 0) return 0;
  return Math.min(configuredCount, max);
}

export function degradeToFree(record: LicenseRecord): LicenseRecord {
  const preserved =
    (record.tier === "lifetime" ||
      record.tier === "pro" ||
      record.tier === "compare" ||
      record.tier === "single") &&
    record.status !== "disabled";
  return {
    ...record,
    tier: preserved ? record.tier : "free",
    status: record.status === "expired" || record.status === "disabled" ? record.status : "expired",
  };
}

export function displayTier(tier: LicenseTier, access: FeatureAccess): string {
  if (access.pro) {
    if (tier === "lifetime") return "Lifetime Pass";
    return "Olympiad Pro";
  }
  if (access.tier === "compare") return "Olympiad Compare";
  if (access.tier === "single") return "Olympiad Single";
  return "Free Player";
}
