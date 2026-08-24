import { afterEach, describe, expect, it } from "vitest";
import {
  consumeSignedMagicLinkToken,
  createSignedMagicLinkToken,
} from "@/lib/auth/magic-link";

describe("signed magic links", () => {
  afterEach(() => {
    delete process.env.AUTH_SECRET;
  });

  it("creates and consumes a valid token", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = createSignedMagicLinkToken("Buyer@Example.com", 60_000);
    expect(consumeSignedMagicLinkToken(token)).toBe("buyer@example.com");
  });

  it("rejects expired tokens", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = createSignedMagicLinkToken("buyer@example.com", -1);
    expect(consumeSignedMagicLinkToken(token)).toBeNull();
  });

  it("rejects tampered tokens", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = createSignedMagicLinkToken("buyer@example.com", 60_000);
    expect(consumeSignedMagicLinkToken(`${token}x`)).toBeNull();
  });
});
