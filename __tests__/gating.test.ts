import { describe, expect, it } from "vitest";
import { featureLocked, isPremiumActive, maxPodiumLanes } from "@/lib/gating";
import { degradeToFree } from "@/lib/gating";

describe("featureLocked", () => {
  it("locks all modes and Coach for Free Player", () => {
    const free = { pro: false, tier: "free" as const };
    expect(featureLocked("single", free)).toBe(true);
    expect(featureLocked("compare", free)).toBe(true);
    expect(featureLocked("podium", free)).toBe(true);
    expect(featureLocked("coach", free)).toBe(true);
  });

  it("unlocks only single mode on Single plan", () => {
    const single = { pro: false, tier: "single" as const };
    expect(featureLocked("single", single)).toBe(false);
    expect(featureLocked("compare", single)).toBe(true);
    expect(featureLocked("podium", single)).toBe(true);
    expect(featureLocked("coach", single)).toBe(true);
  });

  it("unlocks compare and podium on Compare plan; Coach on Pro only", () => {
    const compare = { pro: false, tier: "compare" as const };
    const pro = { pro: true, tier: "pro" as const };
    expect(featureLocked("compare", compare)).toBe(false);
    expect(featureLocked("podium", compare)).toBe(false);
    expect(featureLocked("coach", compare)).toBe(true);
    expect(featureLocked("coach", pro)).toBe(false);
  });
});

describe("maxPodiumLanes", () => {
  it("returns 2 for Compare and 6 for Pro", () => {
    expect(maxPodiumLanes({ pro: false, tier: "compare" })).toBe(2);
    expect(maxPodiumLanes({ pro: true, tier: "pro" })).toBe(6);
    expect(maxPodiumLanes({ pro: false, tier: "single" })).toBe(0);
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
    expect(expired.tier).toBe("pro");
    expect(isPremiumActive(expired)).toBe(false);
  });
});
