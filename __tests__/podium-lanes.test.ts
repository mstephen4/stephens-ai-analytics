import { describe, expect, it } from "vitest";
import { activeLaneIds, DEFAULT_PODIUM, emptyKeys, getAthlete, laneIndexForCoachPick, mergeKeys, reconcilePodiumLanes } from "@/lib/models";

describe("activeLaneIds", () => {
  it("drops empty lane slots", () => {
    expect(activeLaneIds(["openai:gpt-4o-mini", "", "google:gemini-3.6-flash"])).toEqual([
      "openai:gpt-4o-mini",
      "google:gemini-3.6-flash",
    ]);
  });
});

describe("laneIndexForCoachPick", () => {
  it("targets the first empty lane", () => {
    expect(laneIndexForCoachPick(["openai:gpt-4o-mini", ""], "google:gemini-3.6-flash")).toBe(1);
  });

  it("keeps an existing lane when the model is already selected", () => {
    expect(laneIndexForCoachPick(["openai:gpt-4o-mini", "google:gemini-3.6-flash"], "google:gemini-3.6-flash")).toBe(
      1,
    );
  });

  it("falls back to lane 1 when every lane is filled", () => {
    expect(
      laneIndexForCoachPick(["openai:gpt-4o-mini", "anthropic:claude-haiku-3.5"], "google:gemini-3.6-flash"),
    ).toBe(0);
  });
});

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

  it("preserves intentionally empty lane slots", () => {
    const keys = mergeKeys({
      openai: "sk-openai",
      google: "sk-google",
    });
    const lanes = reconcilePodiumLanes(
      ["openai:gpt-4o-mini", "", "google:gemini-3.6-flash", ""],
      keys,
      6,
    );
    expect(lanes).toEqual(["openai:gpt-4o-mini", "", "google:gemini-3.6-flash", ""]);
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

  it("routes legacy Gemini Flash lane ids to gemini-3.6-flash", () => {
    expect(getAthlete("google:gemini-2.0-flash")?.apiModel).toBe("gemini-3.6-flash");
    expect(getAthlete("google:gemini-2.5-flash")?.apiModel).toBe("gemini-3.6-flash");
  });
});
