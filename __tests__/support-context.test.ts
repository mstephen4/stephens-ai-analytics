import { describe, expect, it } from "vitest";
import { buildSupportSystemPrompt, tagSupportMessage } from "@/lib/support-context";

describe("support-context", () => {
  it("includes plan pricing in the system prompt", () => {
    const prompt = buildSupportSystemPrompt("https://example.com");
    expect(prompt).toContain("$5/mo");
    expect(prompt).toContain("BYOK");
    expect(prompt).toContain("https://example.com/pricing");
  });

  it("tags billing and vault messages", () => {
    expect(tagSupportMessage("How do I subscribe with Stripe?")).toContain("billing");
    expect(tagSupportMessage("Where do I paste my OpenAI key?")).toContain("vault");
    expect(tagSupportMessage("I need a refund from a human")).toContain("escalate");
  });
});
