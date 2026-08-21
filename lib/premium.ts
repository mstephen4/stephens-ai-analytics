import { isPremiumActive } from "./gating";
import { licenseUnlocksSingle } from "./license";
import type { LicenseRecord, LicenseTier } from "./types";

export type PremiumSource = "trial" | "account_license" | "local_license" | null;

export interface PremiumStatus {
  premium: boolean;
  single: boolean;
  source: PremiumSource;
  tier: LicenseTier;
  trialEndsAt: number | null;
  email: string | null;
}

export interface AccountInfo {
  signedIn: boolean;
  email: string | null;
  premium: boolean;
  single: boolean;
  source: PremiumSource;
  tier: LicenseTier;
  trialEndsAt: number | null;
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
      single: true,
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
  }

  if (account?.signedIn && account.trialEndsAt && account.trialEndsAt > Date.now()) {
    return {
      premium: true,
      single: true,
      source: "trial",
      tier: "pro",
      trialEndsAt,
      email,
    };
  }

  if (account?.signedIn && account.single) {
    return {
      premium: false,
      single: true,
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
  }

  if (localLicense && isPremiumActive(localLicense)) {
    return {
      premium: true,
      single: true,
      source: "local_license",
      tier: localLicense.tier,
      trialEndsAt,
      email,
    };
  }

  if (localLicense && licenseUnlocksSingle(localLicense.tier, localLicense.status)) {
    return {
      premium: false,
      single: true,
      source: "local_license",
      tier: localLicense.tier,
      trialEndsAt,
      email,
    };
  }

  return { premium: false, single: false, source: null, tier: "free", trialEndsAt, email };
}

export function displayPremiumTier(status: PremiumStatus): string {
  if (status.source === "trial") return "Pro Trial";
  if (status.premium) {
    if (status.tier === "lifetime") return "Lifetime Pass";
    return "Olympiad Pro";
  }
  if (status.single) return "Olympiad Single";
  return "Free Player";
}
