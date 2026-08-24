import "server-only";
import {
  licenseUnlocksAnyPaid,
  licenseUnlocksComparePlan,
  licenseUnlocksPremium,
  licenseUnlocksSinglePlan,
} from "./license";
import type { LicenseTier } from "./types";
import { getLicenseByEmail, getUserById, type DbUser } from "./auth/users";
import type { PremiumStatus } from "./premium";
import { lookupAndSyncLicenseByEmail } from "./stripe-server";

export function isTrialActive(user: DbUser | null): boolean {
  if (!user?.trialEndsAt) return false;
  return user.trialEndsAt > Date.now();
}

function tierFromDb(raw: string): LicenseTier {
  if (raw === "lifetime") return "lifetime";
  if (raw === "pro") return "pro";
  if (raw === "compare") return "compare";
  if (raw === "single") return "single";
  return "free";
}

function statusFromStripeSubscription(
  tier: LicenseTier,
  status: string,
  email: string | null,
  trialEndsAt: number | null,
): PremiumStatus | null {
  if (licenseUnlocksPremium(tier, status)) {
    return {
      premium: true,
      subscribed: true,
      source: "stripe",
      tier,
      trialEndsAt,
      email,
    };
  }
  if (licenseUnlocksComparePlan(tier, status)) {
    return {
      premium: false,
      subscribed: true,
      source: "stripe",
      tier: "compare",
      trialEndsAt,
      email,
    };
  }
  if (licenseUnlocksSinglePlan(tier, status)) {
    return {
      premium: false,
      subscribed: true,
      source: "stripe",
      tier: "single",
      trialEndsAt,
      email,
    };
  }
  return null;
}

export function resolvePremium(user: DbUser | null): PremiumStatus {
  const email = user?.email ?? null;
  const trialEndsAt = user?.trialEndsAt ?? null;

  if (isTrialActive(user)) {
    return { premium: true, subscribed: true, source: "trial", tier: "pro", trialEndsAt, email };
  }

  if (email) {
    try {
      const linked = getLicenseByEmail(email);
      if (linked && licenseUnlocksAnyPaid(tierFromDb(linked.tier), linked.status)) {
        const resolved = statusFromStripeSubscription(
          tierFromDb(linked.tier),
          linked.status,
          email,
          trialEndsAt,
        );
        if (resolved) return resolved;
      }
    } catch (error) {
      console.error("[premium] local license lookup failed", error);
    }
  }

  return { premium: false, subscribed: false, source: null, tier: "free", trialEndsAt, email };
}

export interface PremiumUserHints {
  email?: string | null;
  trialEndsAt?: number | null;
}

function userFromHints(userId: string, hints?: PremiumUserHints): DbUser | null {
  if (!hints?.email) return null;
  return {
    id: userId,
    email: hints.email,
    trialStartedAt: null,
    trialEndsAt: hints.trialEndsAt ?? null,
    createdAt: Date.now(),
  };
}

export async function resolvePremiumForUser(
  userId: string,
  hints?: PremiumUserHints,
): Promise<PremiumStatus> {
  let user: DbUser | null = null;
  try {
    user = getUserById(userId);
  } catch (error) {
    console.error("[premium] user lookup failed", error);
  }
  if (!user) user = userFromHints(userId, hints);

  const local = resolvePremium(user);
  if (local.subscribed || local.premium) return local;

  const email = user?.email?.trim().toLowerCase();
  if (!email) return local;

  try {
    const stripeLicense = await lookupAndSyncLicenseByEmail(email);
    if (!stripeLicense) return local;

    const resolved = statusFromStripeSubscription(
      stripeLicense.tier,
      stripeLicense.status,
      email,
      user?.trialEndsAt ?? null,
    );
    return resolved ?? local;
  } catch (error) {
    console.error("[premium] stripe lookup failed", error);
    return local;
  }
}
