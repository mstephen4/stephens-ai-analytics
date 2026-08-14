import { describe, expect, it } from "vitest";
import { licenseUnlocksPremium, verifyArenaLicense, type LicenseEnv } from "@/lib/license";

const env: LicenseEnv = {
  storeId: "10",
  productId: "20",
  proVariantId: "30",
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

  it("accepts only Arena Pro and Lifetime variants", () => {
    expect(verifyArenaLicense({ store_id: 10, product_id: 20, variant_id: 30 }, env)).toEqual({
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
    expect(licenseUnlocksPremium("lifetime", "active")).toBe(true);
    expect(licenseUnlocksPremium("lifetime", "disabled")).toBe(false);
    expect(licenseUnlocksPremium("free", "active")).toBe(false);
  });
});
