import { describe, expect, it } from "vitest";
import { DEFAULT_PODIUM, emptyKeys, getAthlete, mergeKeys, reconcilePodiumLanes } from "@/lib/models";

describe("reconcilePodiumLanes", () => {
  it("replaces lanes for providers without vault keys", () => {
    const keys = mergeKeys({
      openai: "sk-openai",
      anthropic: "sk-anthropic",
      google: "sk-google",
    });
    const legacy = [
      "openai:gpt-4o",
      "anthropic:claude-sonnet-4",
      "google:gemini-3.1-pro-preview",
      "deepseek:deepseek-chat",
      "xai:grok-2-1212",
      "mistral:mistral-large-latest",
    ];
    const lanes = reconcilePodiumLanes(legacy, keys, 6);
    expect(lanes).toHaveLength(6);
    expect(lanes.every((id) => id.startsWith("openai:") || id.startsWith("anthropic:") || id.startsWith("google:"))).toBe(
      true,
    );
  });

  it("defaults to BYOK-friendly providers only", () => {
    expect(
      DEFAULT_PODIUM.every((id) => {
        const provider = id.split(":")[0];
        return provider === "openai" || provider === "anthropic" || provider === "google";
      }),
    ).toBe(true);
  });

  it("leaves lanes unchanged when no keys are saved", () => {
    const lanes = reconcilePodiumLanes(DEFAULT_PODIUM, emptyKeys(), 6);
    expect(lanes).toEqual(DEFAULT_PODIUM);
  });

  it("resolves retired Google Pro id to Gemini 3.1 Pro", () => {
    const athlete = getAthlete("google:gemini-2.5-pro");
    expect(athlete?.apiModel).toBe("gemini-3.1-pro-preview");
  });

  it("uses current Anthropic API model ids", () => {
    expect(getAthlete("anthropic:claude-sonnet-4")?.apiModel).toBe("claude-sonnet-4-6");
    expect(getAthlete("anthropic:claude-opus-4")?.apiModel).toBe("claude-opus-4-8");
    expect(getAthlete("anthropic:claude-haiku-3.5")?.apiModel).toBe("claude-haiku-4-5");
  });

  it("routes legacy Gemini 2.0 Flash lane to gemini-2.5-flash", () => {
    expect(getAthlete("google:gemini-2.0-flash")?.apiModel).toBe("gemini-2.5-flash");
  });
});
