import type { LicenseTier } from "./types";

export function isPaidTier(tier: LicenseTier): boolean {
  return tier === "single" || tier === "compare" || tier === "pro" || tier === "lifetime";
}

function licenseActive(status: string | undefined): boolean {
  return status === "active" || status === "inactive";
}

export function licenseUnlocksPremium(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  if (tier !== "pro" && tier !== "lifetime") return false;
  if (tier === "lifetime") {
    return status !== "disabled" && status !== "expired";
  }
  return licenseActive(status);
}

/** Olympiad Single plan — single-mode chat only. */
export function licenseUnlocksSinglePlan(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  return tier === "single" && licenseActive(status);
}

/** Olympiad Compare plan — compare mode + 2-lane Podium. Pro/Lifetime include this. */
export function licenseUnlocksComparePlan(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  if (tier === "compare") return licenseActive(status);
  if (tier === "pro" || tier === "lifetime") return licenseUnlocksPremium(tier, status);
  return false;
}

/** Any paid plan (Single, Compare, Pro, or Lifetime). */
export function licenseUnlocksAnyPaid(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  return (
    licenseUnlocksSinglePlan(tier, status) ||
    licenseUnlocksComparePlan(tier, status) ||
    licenseUnlocksPremium(tier, status)
  );
}

/** @deprecated Use licenseUnlocksAnyPaid */
export function licenseUnlocksSingle(
  tier: LicenseTier,
  status: string | undefined,
): boolean {
  return licenseUnlocksAnyPaid(tier, status);
}
