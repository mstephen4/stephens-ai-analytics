import { describe, expect, it } from "vitest";
import { buildStats, formatUsd, usdCost } from "@/lib/cost";

describe("scoreboard cost", () => {
  it("prices tokens against the athlete catalog", () => {
    const cost = usdCost("openai:gpt-4o-mini", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(0.75);
    expect(formatUsd(0.0032)).toBe("$0.0032");
  });

  it("computes tokens/sec from generation time", () => {
    const stats = buildStats("google:gemini-3.6-flash", 2000, 100, 200);
    expect(stats.tokensPerSec).toBe(100);
    expect(stats.generationMs).toBe(2000);
  });
});
