import { describe, expect, it } from "vitest";
import { getProCheckoutUrl, PRO_SUBSCRIPTION_TAGLINE } from "@/lib/subscription";

describe("subscription helpers", () => {
  it("prefills checkout email when provided", () => {
    const prev = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO;
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO = "https://example.lemonsqueezy.com/checkout/buy/pro";
    expect(getProCheckoutUrl("user@example.com")).toContain("checkout%5Bemail%5D=user%40example.com");
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO = prev;
  });

  it("exposes single-user subscription tagline", () => {
    expect(PRO_SUBSCRIPTION_TAGLINE).toMatch(/one vault/i);
  });
});
