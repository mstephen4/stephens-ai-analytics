import { describe, expect, it } from "vitest";
import { featureLocked, isPremiumActive } from "@/lib/gating";
import { degradeToFree } from "@/lib/gating";

describe("featureLocked", () => {
  it("locks Podium and Coach for Free Player", () => {
    const free = { pro: false, single: false };
    expect(featureLocked("podium", free)).toBe(true);
    expect(featureLocked("coach", free)).toBe(true);
    expect(featureLocked("compare", free)).toBe(true);
  });

  it("unlocks compare for Single and everything for Pro", () => {
    const single = { pro: false, single: true };
    const pro = { pro: true, single: true };
    expect(featureLocked("compare", single)).toBe(false);
    expect(featureLocked("podium", single)).toBe(true);
    expect(featureLocked("podium", pro)).toBe(false);
    expect(featureLocked("coach", pro)).toBe(false);
  });
});

describe("isPremiumActive", () => {
  it("treats active Pro as premium", () => {
    expect(
      isPremiumActive({
        licenseKey: "x",
        instanceId: "i",
        instanceName: "n",
        tier: "pro",
        status: "active",
        lastValidatedAt: 0,
        expiresAt: null,
      }),
    ).toBe(true);
  });
});

describe("degradeToFree", () => {
  it("degrades expired Pro without treating it as premium", () => {
    const expired = degradeToFree({
      licenseKey: "x",
      instanceId: "i",
      instanceName: "n",
      tier: "pro",
      status: "expired",
      lastValidatedAt: 0,
      expiresAt: null,
    });
    expect(expired.tier).toBe("free");
    expect(isPremiumActive(expired)).toBe(false);
  });
});
