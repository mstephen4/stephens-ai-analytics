import { isPremiumActive } from "./gating";
import type { LicenseRecord, LicenseTier } from "./types";

export type PremiumSource = "trial" | "account_license" | "local_license" | null;

export interface PremiumStatus {
  premium: boolean;
  source: PremiumSource;
  tier: LicenseTier;
  trialEndsAt: number | null;
  email: string | null;
}

export interface AccountInfo {
  signedIn: boolean;
  email: string | null;
  premium: boolean;
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
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
  }

  if (localLicense && isPremiumActive(localLicense)) {
    return {
      premium: true,
      source: "local_license",
      tier: localLicense.tier,
      trialEndsAt,
      email,
    };
  }

  return { premium: false, source: null, tier: "free", trialEndsAt, email };
}

export function displayPremiumTier(status: PremiumStatus): string {
  if (!status.premium) return "Free Player";
  if (status.source === "trial") return "Pro Trial";
  if (status.tier === "lifetime") return "Lifetime Pass";
  if (status.tier === "pro") return "Olympiad Pro";
  return "Free Player";
}
