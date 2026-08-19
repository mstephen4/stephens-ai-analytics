import "server-only";
import { isPremiumActive } from "./gating";
import { licenseUnlocksPremium } from "./license";
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
  const tier = (linked.tier === "lifetime" ? "lifetime" : linked.tier === "pro" ? "pro" : "free") as LicenseTier;
  if (!licenseUnlocksPremium(tier, linked.status as LicenseRecord["status"])) return null;
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
    return { premium: true, source: "trial", tier: "pro", trialEndsAt, email };
  }

  const accountLicense = email ? accountLicenseForEmail(email) : null;
  if (accountLicense && isPremiumActive(accountLicense)) {
    return {
      premium: true,
      source: "account_license",
      tier: accountLicense.tier,
      trialEndsAt,
      email,
    };
  }

  if (options.localLicense && isPremiumActive(options.localLicense)) {
    return {
      premium: true,
      source: "local_license",
      tier: options.localLicense.tier,
      trialEndsAt,
      email,
    };
  }

  return { premium: false, source: null, tier: "free", trialEndsAt, email };
}

export async function resolvePremiumForUser(
  userId: string,
  localLicense: LicenseRecord | null,
): Promise<PremiumStatus> {
  const user = getUserById(userId);
  return resolvePremium({ user, localLicense });
}
