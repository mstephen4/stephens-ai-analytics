import { describe, expect, it } from "vitest";
import { featureLocked, isPremiumActive } from "@/lib/gating";
import type { LicenseRecord } from "@/lib/types";

function record(overrides: Partial<LicenseRecord>): LicenseRecord {
  return {
    licenseKey: "KEY",
    instanceId: "inst",
    instanceName: "Olympiad/test",
    tier: "free",
    status: "inactive",
    lastValidatedAt: 0,
    expiresAt: null,
    ...overrides,
  };
}

describe("feature gating", () => {
  it("locks The Podium and The Coach for Free Player", () => {
    expect(featureLocked("podium", false)).toBe(true);
    expect(featureLocked("coach", false)).toBe(true);
  });

  it("unlocks premium while Pro is active", () => {
    const pro = record({ tier: "pro", status: "active" });
    expect(isPremiumActive(pro)).toBe(true);
    expect(featureLocked("podium", true)).toBe(false);
    expect(featureLocked("coach", true)).toBe(false);
  });

  it("degrades expired Pro without treating it as premium", () => {
    const expired = record({ tier: "pro", status: "expired" });
    expect(isPremiumActive(expired)).toBe(false);
    expect(featureLocked("podium", isPremiumActive(expired))).toBe(true);
  });
});
