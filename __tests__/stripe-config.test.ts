import { describe, expect, it } from "vitest";
import { priceIdForPlan, readStripePriceEnv, tierFromPriceId } from "@/lib/stripe-config";

const prices = {
  singleMonthly: "price_single_m",
  singleYearly: "price_single_y",
  compareMonthly: "price_compare_m",
  compareYearly: "price_compare_y",
  proMonthly: "price_pro_m",
  proYearly: "price_pro_y",
  lifetime: "price_lifetime",
};

describe("tierFromPriceId", () => {
  it("maps Stripe prices to license tiers", () => {
    expect(tierFromPriceId("price_single_m", prices)).toBe("single");
    expect(tierFromPriceId("price_compare_y", prices)).toBe("compare");
    expect(tierFromPriceId("price_pro_m", prices)).toBe("pro");
    expect(tierFromPriceId("price_lifetime", prices)).toBe("lifetime");
    expect(tierFromPriceId("price_unknown", prices)).toBeNull();
  });
});

describe("priceIdForPlan", () => {
  it("returns configured price ids", () => {
    expect(priceIdForPlan("single", "monthly", prices)).toBe("price_single_m");
    expect(priceIdForPlan("compare", "yearly", prices)).toBe("price_compare_y");
    expect(priceIdForPlan("pro", "monthly", prices)).toBe("price_pro_m");
  });
});

describe("readStripePriceEnv", () => {
  it("returns null when required prices are missing", () => {
    expect(readStripePriceEnv({})).toBeNull();
  });

  it("reads configured Stripe prices from env", () => {
    expect(
      readStripePriceEnv({
        STRIPE_PRICE_SINGLE_MONTHLY: "a",
        STRIPE_PRICE_SINGLE_YEARLY: "b",
        STRIPE_PRICE_COMPARE_MONTHLY: "c",
        STRIPE_PRICE_COMPARE_YEARLY: "d",
        STRIPE_PRICE_PRO_MONTHLY: "e",
        STRIPE_PRICE_PRO_YEARLY: "f",
      }),
    ).toEqual({
      singleMonthly: "a",
      singleYearly: "b",
      compareMonthly: "c",
      compareYearly: "d",
      proMonthly: "e",
      proYearly: "f",
      lifetime: undefined,
    });
  });
});
