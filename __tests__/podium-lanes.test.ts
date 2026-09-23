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

  it("ships an expanded default podium lineup", () => {
    expect(DEFAULT_PODIUM.length).toBeGreaterThanOrEqual(6);
    expect(DEFAULT_PODIUM.every((id) => Boolean(getAthlete(id)))).toBe(true);
  });

  it("leaves lanes unchanged when no keys are saved", () => {
    const lanes = reconcilePodiumLanes(DEFAULT_PODIUM, emptyKeys(), DEFAULT_PODIUM.length);
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

  it("keeps Gemini 2.5 Pro on the roster until Google retires it", () => {
    expect(getAthlete("google:gemini-2.5-pro")?.apiModel).toBe("gemini-2.5-pro");
  });

  it("uses current Anthropic API model ids", () => {
    expect(getAthlete("anthropic:claude-sonnet-4")?.apiModel).toBe("claude-sonnet-4-6");
    expect(getAthlete("anthropic:claude-opus-4")?.apiModel).toBe("claude-opus-4-8");
    expect(getAthlete("anthropic:claude-haiku-3.5")?.apiModel).toBe("claude-haiku-4-5");
  });

  it("routes legacy Gemini 2.0 Flash lane ids to gemini-3.6-flash", () => {
    expect(getAthlete("google:gemini-2.0-flash")?.apiModel).toBe("gemini-3.6-flash");
    expect(getAthlete("google:gemini-2.5-flash")?.apiModel).toBe("gemini-2.5-flash");
  });

  it("routes retired Groq and xAI ids to current models", () => {
    expect(getAthlete("groq:mixtral-8x7b-32768")?.apiModel).toBe("openai/gpt-oss-120b");
    expect(getAthlete("groq:llama-3.1-8b-instant")?.apiModel).toBe("openai/gpt-oss-20b");
    expect(getAthlete("xai:grok-2-mini")?.apiModel).toBe("grok-4-fast-non-reasoning");
  });
});
