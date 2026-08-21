import "server-only";
import { isPremiumActive } from "./gating";
import { licenseUnlocksPremium, licenseUnlocksSingle } from "./license";
import type { LicenseRecord, LicenseTier } from "./types";
import { getLicenseByEmail, getUserById, type DbUser } from "./auth/users";
import type { PremiumStatus } from "./premium";

export function isTrialActive(user: DbUser | null): boolean {
  if (!user?.trialEndsAt) return false;
  return user.trialEndsAt > Date.now();
}

export function accountLicenseForEmail(email: string): LicenseRecord | null {
  const linked = getLicenseByEmail(email);
  if (!linked) return null;
  const tier = (
    linked.tier === "lifetime"
      ? "lifetime"
      : linked.tier === "pro"
        ? "pro"
        : linked.tier === "single"
          ? "single"
          : "free"
  ) as LicenseTier;
  if (!licenseUnlocksSingle(tier, linked.status) && !licenseUnlocksPremium(tier, linked.status)) {
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
  if (accountLicense && licenseUnlocksPremium(accountLicense.tier, accountLicense.status)) {
    return {
      premium: true,
      subscribed: true,
      source: "account_license",
      tier: accountLicense.tier,
      trialEndsAt,
      email,
    };
  }
  if (accountLicense && licenseUnlocksSingle(accountLicense.tier, accountLicense.status)) {
    return {
      premium: false,
      subscribed: true,
      source: "account_license",
      tier: accountLicense.tier,
      trialEndsAt,
      email,
    };
  }

  if (options.localLicense && licenseUnlocksPremium(options.localLicense.tier, options.localLicense.status)) {
    return {
      premium: true,
      subscribed: true,
      source: "local_license",
      tier: options.localLicense.tier,
      trialEndsAt,
      email,
    };
  }
  if (options.localLicense && licenseUnlocksSingle(options.localLicense.tier, options.localLicense.status)) {
    return {
      premium: false,
      subscribed: true,
      source: "local_license",
      tier: options.localLicense.tier,
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
