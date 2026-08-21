import "server-only";
import { isPremiumActive } from "./gating";
import {
  licenseUnlocksAnyPaid,
  licenseUnlocksComparePlan,
  licenseUnlocksPremium,
  licenseUnlocksSinglePlan,
} from "./license";
import type { LicenseRecord, LicenseTier } from "./types";
import { getLicenseByEmail, getUserById, type DbUser } from "./auth/users";
import type { PremiumStatus } from "./premium";

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

export function accountLicenseForEmail(email: string): LicenseRecord | null {
  const linked = getLicenseByEmail(email);
  if (!linked) return null;
  const tier = tierFromDb(linked.tier);
  if (!licenseUnlocksAnyPaid(tier, linked.status)) {
    return null;
  }
  return {
    licenseKey: linked.license_key,
    instanceId: "",
    instanceName: "AI Olympiad",
    tier,
    status: linked.status as LicenseRecord["status"],
    lastValidatedAt: Date.now(),
    expiresAt: null,
  };
}

function statusFromAccountLicense(license: LicenseRecord, email: string | null, trialEndsAt: number | null): PremiumStatus {
  const { tier, status } = license;
  if (licenseUnlocksPremium(tier, status)) {
    return {
      premium: true,
      subscribed: true,
      source: "account_license",
      tier,
      trialEndsAt,
      email,
    };
  }
  if (licenseUnlocksComparePlan(tier, status)) {
    return {
      premium: false,
      subscribed: true,
      source: "account_license",
      tier: "compare",
      trialEndsAt,
      email,
    };
  }
  return {
    premium: false,
    subscribed: true,
    source: "account_license",
    tier: "single",
    trialEndsAt,
    email,
  };
}

export function resolvePremium(options: {
  user: DbUser | null;
  localLicense: LicenseRecord | null;
}): PremiumStatus {
  const email = options.user?.email ?? null;
  const trialEndsAt = options.user?.trialEndsAt ?? null;

  if (isTrialActive(options.user)) {
    return { premium: true, subscribed: true, source: "trial", tier: "pro", trialEndsAt, email };
  }

  const accountLicense = email ? accountLicenseForEmail(email) : null;
  if (accountLicense) {
    return statusFromAccountLicense(accountLicense, email, trialEndsAt);
  }

  if (options.localLicense && isPremiumActive(options.localLicense)) {
    return {
      premium: true,
      subscribed: true,
      source: "local_license",
      tier: options.localLicense.tier,
      trialEndsAt,
      email,
    };
  }
  if (options.localLicense && licenseUnlocksComparePlan(options.localLicense.tier, options.localLicense.status)) {
    return {
      premium: false,
      subscribed: true,
      source: "local_license",
      tier: "compare",
      trialEndsAt,
      email,
    };
  }
  if (options.localLicense && licenseUnlocksSinglePlan(options.localLicense.tier, options.localLicense.status)) {
    return {
      premium: false,
      subscribed: true,
      source: "local_license",
      tier: "single",
      trialEndsAt,
      email,
    };
  }

  return { premium: false, subscribed: false, source: null, tier: "free", trialEndsAt, email };
}

export async function resolvePremiumForUser(
  userId: string,
  localLicense: LicenseRecord | null,
): Promise<PremiumStatus> {
  const user = getUserById(userId);
  return resolvePremium({ user, localLicense });
}
