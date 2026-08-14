import type { Athlete, ProviderId, ProviderKeys } from "./types";

export const ATHLETES: Athlete[] = [
  {
    id: "openai:gpt-4o-mini",
    name: "GPT-4o Mini",
    shortName: "4o Mini",
    provider: "openai",
    apiModel: "gpt-4o-mini",
    role: "sprinter",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    strengths: ["fast Q&A", "cheap routing", "summaries"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "openai:gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    shortName: "4.1 Mini",
    provider: "openai",
    apiModel: "gpt-4.1-mini",
    role: "sprinter",
    inputCostPer1M: 0.4,
    outputCostPer1M: 1.6,
    strengths: ["instruction following", "light coding"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "openai:gpt-4o",
    name: "GPT-4o",
    shortName: "GPT-4o",
    provider: "openai",
    apiModel: "gpt-4o",
    role: "allrounder",
    inputCostPer1M: 2.5,
    outputCostPer1M: 10,
    strengths: ["multimodal reasoning", "generalist"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "openai:gpt-4.1",
    name: "GPT-4.1",
    shortName: "GPT-4.1",
    provider: "openai",
    apiModel: "gpt-4.1",
    role: "heavy",
    inputCostPer1M: 2,
    outputCostPer1M: 8,
    strengths: ["long context", "software engineering"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "openai:o4-mini",
    name: "o4-mini",
    shortName: "o4-mini",
    provider: "openai",
    apiModel: "o4-mini",
    role: "heavy",
    inputCostPer1M: 1.1,
    outputCostPer1M: 4.4,
    strengths: ["math", "reasoning", "science"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "anthropic:claude-haiku-3.5",
    name: "Claude 3.5 Haiku",
    shortName: "Haiku",
    provider: "anthropic",
    apiModel: "claude-3-5-haiku-20241022",
    role: "sprinter",
    inputCostPer1M: 0.8,
    outputCostPer1M: 4,
    strengths: ["fast classification", "tight prose"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "anthropic:claude-sonnet-4",
    name: "Claude Sonnet 4",
    shortName: "Sonnet 4",
    provider: "anthropic",
    apiModel: "claude-sonnet-4-20250514",
    role: "allrounder",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    strengths: ["coding", "writing", "careful analysis"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "anthropic:claude-opus-4",
    name: "Claude Opus 4",
    shortName: "Opus 4",
    provider: "anthropic",
    apiModel: "claude-opus-4-20250514",
    role: "heavy",
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    strengths: ["deep reasoning", "hard engineering"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "google:gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    shortName: "Flash 2.0",
    provider: "google",
    apiModel: "gemini-2.0-flash",
    role: "sprinter",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    strengths: ["lowest cost", "snappy Q&A", "routing"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "google:gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    shortName: "Flash 2.5",
    provider: "google",
    apiModel: "gemini-2.5-flash",
    role: "allrounder",
    inputCostPer1M: 0.3,
    outputCostPer1M: 2.5,
    strengths: ["balanced quality", "long context"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "google:gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    shortName: "Gemini Pro",
    provider: "google",
    apiModel: "gemini-2.5-pro",
    role: "heavy",
    inputCostPer1M: 1.25,
    outputCostPer1M: 10,
    strengths: ["analysis", "research", "reasoning"],
    judgeEligible: false,
    classifierEligible: false,
  },
];

export const DEFAULT_SINGLE = "openai:gpt-4o-mini";
export const DEFAULT_PODIUM: [string, string, string] = [
  "openai:gpt-4o",
  "anthropic:claude-sonnet-4",
  "google:gemini-2.5-pro",
];

export function getAthlete(id: string): Athlete | undefined {
  return ATHLETES.find((athlete) => athlete.id === id);
}

export function athletesForKeys(keys: ProviderKeys): Athlete[] {
  return ATHLETES.filter((athlete) => Boolean(keys[athlete.provider]?.trim()));
}

export function hasAnyKey(keys: ProviderKeys): boolean {
  return Object.values(keys).some((value) => Boolean(value.trim()));
}

export function keyHeaderName(provider: ProviderId): string {
  return {
    openai: "x-arena-openai-key",
    anthropic: "x-arena-anthropic-key",
    google: "x-arena-google-key",
  }[provider];
}

export function emptyKeys(): ProviderKeys {
  return { openai: "", anthropic: "", google: "" };
}

export function providerLabel(provider: ProviderId): string {
  return { openai: "OpenAI", anthropic: "Anthropic", google: "Google" }[provider];
}
