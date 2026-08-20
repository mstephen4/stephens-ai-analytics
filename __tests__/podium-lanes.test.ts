import { describe, expect, it } from "vitest";
import { DEFAULT_PODIUM, emptyKeys, mergeKeys, reconcilePodiumLanes } from "@/lib/models";

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
      "google:gemini-2.5-pro",
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
});
