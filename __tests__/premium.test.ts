import { describe, expect, it } from "vitest";
import { resolvePremiumFromAccount } from "@/lib/premium";

describe("resolvePremiumFromAccount", () => {
  it("returns trial when signed in with active trial", () => {
    const status = resolvePremiumFromAccount({
      signedIn: true,
      email: "a@b.com",
      premium: false,
      subscribed: false,
      source: null,
      tier: "free",
      trialEndsAt: Date.now() + 86400000,
    });
    expect(status.premium).toBe(true);
    expect(status.source).toBe("trial");
  });

  it("returns stripe pro when account is premium", () => {
    const status = resolvePremiumFromAccount({
      signedIn: true,
      email: "buyer@example.com",
      premium: true,
      subscribed: true,
      source: "stripe",
      tier: "pro",
      trialEndsAt: null,
    });
    expect(status.premium).toBe(true);
    expect(status.source).toBe("stripe");
  });

  it("returns compare tier for subscribed non-pro accounts", () => {
    const status = resolvePremiumFromAccount({
      signedIn: true,
      email: "buyer@example.com",
      premium: false,
      subscribed: true,
      source: "stripe",
      tier: "compare",
      trialEndsAt: null,
    });
    expect(status.subscribed).toBe(true);
    expect(status.tier).toBe("compare");
  });
});
