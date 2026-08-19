import { describe, expect, it } from "vitest";
import { resolvePremiumFromAccount } from "@/lib/premium";
import type { LicenseRecord } from "@/lib/types";

function record(overrides: Partial<LicenseRecord>): LicenseRecord {
  return {
    licenseKey: "KEY",
    instanceId: "inst",
    instanceName: "Olympiad/test",
    tier: "pro",
    status: "active",
    lastValidatedAt: 0,
    expiresAt: null,
    ...overrides,
  };
}

describe("resolvePremiumFromAccount", () => {
  it("prefers signed-in trial over local free", () => {
    const status = resolvePremiumFromAccount(
      {
        signedIn: true,
        email: "a@b.com",
        premium: true,
        source: "trial",
        tier: "pro",
        trialEndsAt: Date.now() + 86400000,
      },
      null,
    );
    expect(status.premium).toBe(true);
    expect(status.source).toBe("trial");
  });

  it("falls back to local license when account is free", () => {
    const status = resolvePremiumFromAccount(
      {
        signedIn: false,
        email: null,
        premium: false,
        source: null,
        tier: "free",
        trialEndsAt: null,
      },
      record({ tier: "pro", status: "active" }),
    );
    expect(status.premium).toBe(true);
    expect(status.source).toBe("local_license");
  });

  it("uses account license when signed in with premium", () => {
    const status = resolvePremiumFromAccount(
      {
        signedIn: true,
        email: "buyer@example.com",
        premium: true,
        source: "account_license",
        tier: "lifetime",
        trialEndsAt: null,
      },
      null,
    );
    expect(status.premium).toBe(true);
    expect(status.source).toBe("account_license");
    expect(status.tier).toBe("lifetime");
  });
});
