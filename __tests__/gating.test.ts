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
    expect(featureLocked("podium", null)).toBe(true);
    expect(featureLocked("coach", record({ tier: "free", status: "active" }))).toBe(true);
  });

  it("unlocks premium while a Pro key is active", () => {
    const pro = record({ tier: "pro", status: "active" });
    expect(isPremiumActive(pro)).toBe(true);
    expect(featureLocked("podium", pro)).toBe(false);
    expect(featureLocked("coach", pro)).toBe(false);
  });

  it("degrades expired Pro without treating it as premium", () => {
    const expired = record({ tier: "pro", status: "expired" });
    expect(isPremiumActive(expired)).toBe(false);
    expect(featureLocked("podium", expired)).toBe(true);
  });
});
