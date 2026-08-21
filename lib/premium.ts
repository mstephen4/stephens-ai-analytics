import { isPremiumActive } from "./gating";
import {
  licenseUnlocksAnyPaid,
  licenseUnlocksComparePlan,
  licenseUnlocksPremium,
  licenseUnlocksSinglePlan,
} from "./license";
import type { LicenseRecord, LicenseTier } from "./types";

export type PremiumSource = "trial" | "account_license" | "local_license" | null;

export interface PremiumStatus {
  premium: boolean;
  subscribed: boolean;
  source: PremiumSource;
  tier: LicenseTier;
  trialEndsAt: number | null;
  email: string | null;
}

export interface AccountInfo {
  signedIn: boolean;
  email: string | null;
  premium: boolean;
  subscribed: boolean;
  source: PremiumSource;
  tier: LicenseTier;
  trialEndsAt: number | null;
}

function statusFromLicense(license: LicenseRecord): PremiumStatus {
  const { tier, status } = license;
  if (licenseUnlocksPremium(tier, status)) {
    return {
      premium: true,
      subscribed: true,
      source: "local_license",
      tier,
      trialEndsAt: null,
      email: null,
    };
  }
  if (licenseUnlocksComparePlan(tier, status)) {
    return {
      premium: false,
      subscribed: true,
      source: "local_license",
      tier: "compare",
      trialEndsAt: null,
      email: null,
    };
  }
  if (licenseUnlocksSinglePlan(tier, status)) {
    return {
      premium: false,
      subscribed: true,
      source: "local_license",
      tier: "single",
      trialEndsAt: null,
      email: null,
    };
  }
  return {
    premium: false,
    subscribed: false,
    source: null,
    tier: "free",
    trialEndsAt: null,
    email: null,
  };
}

/** Client-side merge of /api/me account status with local license key. */
export function resolvePremiumFromAccount(
  account: AccountInfo | null,
  localLicense: LicenseRecord | null,
): PremiumStatus {
  const email = account?.email ?? null;
  const trialEndsAt = account?.trialEndsAt ?? null;

  if (account?.signedIn && account.premium) {
    return {
      premium: true,
      subscribed: true,
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
  }

  if (account?.signedIn && account.trialEndsAt && account.trialEndsAt > Date.now()) {
    return {
      premium: true,
      subscribed: true,
      source: "trial",
      tier: "pro",
      trialEndsAt,
      email,
    };
  }

  if (account?.signedIn && account.subscribed) {
    return {
      premium: false,
      subscribed: true,
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
  }

  if (localLicense && isPremiumActive(localLicense)) {
    return { ...statusFromLicense(localLicense), trialEndsAt, email };
  }

  if (localLicense && licenseUnlocksComparePlan(localLicense.tier, localLicense.status)) {
    return { ...statusFromLicense(localLicense), trialEndsAt, email };
  }

  if (localLicense && licenseUnlocksSinglePlan(localLicense.tier, localLicense.status)) {
    return { ...statusFromLicense(localLicense), trialEndsAt, email };
  }

  return { premium: false, subscribed: false, source: null, tier: "free", trialEndsAt, email };
}

export function displayPremiumTier(status: PremiumStatus): string {
  if (status.source === "trial") return "Pro Trial";
  if (status.premium) {
    if (status.tier === "lifetime") return "Lifetime Pass";
    return "Olympiad Pro";
  }
  if (status.tier === "compare") return "Olympiad Compare";
  if (status.tier === "single") return "Olympiad Single";
  return "Free Player";
}
