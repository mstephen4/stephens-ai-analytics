import type { LicenseTier } from "./types";

export type PremiumSource = "trial" | "stripe" | null;

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

/** Client-side view of /api/me account status. */
export function resolvePremiumFromAccount(account: AccountInfo | null): PremiumStatus {
  const email = account?.email ?? null;
  const trialEndsAt = account?.trialEndsAt ?? null;

  if (!account?.signedIn) {
    return { premium: false, subscribed: false, source: null, tier: "free", trialEndsAt, email };
  }

  if (account.trialEndsAt && account.trialEndsAt > Date.now()) {
    return {
      premium: true,
      subscribed: true,
      source: "trial",
      tier: "pro",
      trialEndsAt,
      email,
    };
  }

  if (account.premium) {
    return {
      premium: true,
      subscribed: true,
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
  }

  if (account.subscribed) {
    return {
      premium: false,
      subscribed: true,
      source: account.source,
      tier: account.tier,
      trialEndsAt,
      email,
    };
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
