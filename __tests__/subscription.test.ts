import { describe, expect, it } from "vitest";
import { getCheckoutUrl, PLAN_PRICING, PRO_SUBSCRIPTION_TAGLINE } from "@/lib/subscription";

describe("subscription helpers", () => {
  it("prefills checkout email when provided", () => {
    const prev = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO_MONTHLY;
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO_MONTHLY = "https://example.lemonsqueezy.com/checkout/buy/pro";
    expect(getCheckoutUrl("pro", "monthly", "user@example.com")).toContain("checkout%5Bemail%5D=user%40example.com");
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO_MONTHLY = prev;
  });

  it("exposes fixed plan pricing labels", () => {
    expect(PLAN_PRICING.single.monthly.label).toBe("$5/mo");
    expect(PLAN_PRICING.single.yearly.label).toBe("$49/yr");
    expect(PLAN_PRICING.compare.monthly.label).toBe("$7/mo");
    expect(PLAN_PRICING.compare.yearly.label).toBe("$75/yr");
    expect(PLAN_PRICING.pro.monthly.label).toBe("$9/mo");
    expect(PLAN_PRICING.pro.yearly.label).toBe("$99/yr");
  });

  it("exposes single-user subscription tagline", () => {
    expect(PRO_SUBSCRIPTION_TAGLINE).toMatch(/one vault/i);
  });
});
