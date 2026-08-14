import { describe, expect, it } from "vitest";
import { heuristicClassify, parseClassifierJson, recommendAthlete } from "@/lib/classifier";
import type { ProviderKeys } from "@/lib/types";

const allKeys: ProviderKeys = {
  openai: "sk-test",
  anthropic: "sk-ant",
  google: "google",
};

describe("heuristicClassify", () => {
  it("routes code prompts to engineering intent", () => {
    const result = heuristicClassify("Refactor this TypeScript function and fix the compile error");
    expect(result.intent).toBe("code");
    expect(result.complexity).not.toBe("low");
  });

  it("treats short questions as cheap simple_qa", () => {
    const result = heuristicClassify("What is the capital of France?");
    expect(result.intent).toBe("simple_qa");
    expect(result.complexity).toBe("low");
  });

  it("detects math and creative writing", () => {
    expect(heuristicClassify("Prove the Pythagorean theorem using linear algebra").intent).toBe("math");
    expect(heuristicClassify("Write a short story about a bronze-age sprinter").intent).toBe("creative");
  });
});

describe("recommendAthlete", () => {
  it("picks a sprinter for simple Q&A when Flash is available", () => {
    const rec = recommendAthlete("What is 2+2 as a trivia fact?", allKeys);
    expect(rec?.athleteId).toBe("google:gemini-2.0-flash");
  });

  it("stays inside the providers the user actually vaulted", () => {
    const rec = recommendAthlete("What is 2+2 as a trivia fact?", {
      openai: "sk",
      anthropic: "",
      google: "",
    });
    expect(rec?.athleteId.startsWith("openai:")).toBe(true);
  });

  it("returns null without keys", () => {
    expect(recommendAthlete("hello", { openai: "", anthropic: "", google: "" })).toBeNull();
  });
});

describe("parseClassifierJson", () => {
  it("extracts JSON even when the model wraps it in prose", () => {
    const parsed = parseClassifierJson(
      'Sure. {"athleteId":"openai:gpt-4o-mini","justification":"cheap","intent":"simple_qa","complexity":"low"}',
    );
    expect(parsed?.athleteId).toBe("openai:gpt-4o-mini");
  });

  it("rejects unknown athletes", () => {
    expect(parseClassifierJson('{"athleteId":"acme:fake"}')).toBeNull();
  });
});
