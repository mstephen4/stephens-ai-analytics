import { describe, expect, it } from "vitest";
import {
  licenseUnlocksComparePlan,
  licenseUnlocksPremium,
  licenseUnlocksSinglePlan,
  verifyArenaLicense,
  type LicenseEnv,
} from "@/lib/license";

const env: LicenseEnv = {
  storeId: "10",
  productId: "20",
  singleMonthlyVariantId: "25",
  singleYearlyVariantId: "26",
  compareMonthlyVariantId: "27",
  compareYearlyVariantId: "28",
  proMonthlyVariantId: "30",
  proYearlyVariantId: "31",
  lifetimeVariantId: "40",
};

describe("verifyArenaLicense", () => {
  it("rejects a key from another store or product", () => {
    expect(
      verifyArenaLicense({ store_id: 99, product_id: 20, variant_id: 30 }, env).reason,
    ).toBe("wrong_store");
    expect(
      verifyArenaLicense({ store_id: 10, product_id: 99, variant_id: 30 }, env).reason,
    ).toBe("wrong_product");
    expect(
      verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 99 }, env).reason,
    ).toBe("wrong_variant");
  });

  it("accepts Single, Compare, Pro, and Lifetime variants", () => {
    expect(verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 25 }, env)).toEqual({
      ok: true,
      tier: "single",
    });
    expect(verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 27 }, env)).toEqual({
      ok: true,
      tier: "compare",
    });
    expect(verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 31 }, env)).toEqual({
      ok: true,
      tier: "pro",
    });
    expect(verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 40 }, env)).toEqual({
      ok: true,
      tier: "lifetime",
    });
  });

  it("fails closed when Lemon Squeezy IDs are not configured", () => {
    expect(verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 30 }, null).reason).toBe(
      "unconfigured",
    );
  });
});

describe("licenseUnlocksPremium", () => {
  it("locks an expired subscription but keeps a lifetime key unless disabled", () => {
    expect(licenseUnlocksPremium("pro", "expired")).toBe(false);
    expect(licenseUnlocksPremium("pro", "active")).toBe(true);
    expect(licenseUnlocksPremium("single", "active")).toBe(false);
    expect(licenseUnlocksPremium("compare", "active")).toBe(false);
    expect(licenseUnlocksPremium("lifetime", "active")).toBe(true);
    expect(licenseUnlocksPremium("lifetime", "disabled")).toBe(false);
    expect(licenseUnlocksPremium("free", "active")).toBe(false);
  });
});

describe("licenseUnlocksSinglePlan", () => {
  it("allows only the Single tier", () => {
    expect(licenseUnlocksSinglePlan("single", "active")).toBe(true);
    expect(licenseUnlocksSinglePlan("compare", "active")).toBe(false);
    expect(licenseUnlocksSinglePlan("pro", "active")).toBe(false);
    expect(licenseUnlocksSinglePlan("single", "expired")).toBe(false);
  });
});

describe("licenseUnlocksComparePlan", () => {
  it("allows Compare and Pro tiers", () => {
    expect(licenseUnlocksComparePlan("compare", "active")).toBe(true);
    expect(licenseUnlocksComparePlan("pro", "active")).toBe(true);
    expect(licenseUnlocksComparePlan("lifetime", "active")).toBe(true);
    expect(licenseUnlocksComparePlan("single", "active")).toBe(false);
  });
});
