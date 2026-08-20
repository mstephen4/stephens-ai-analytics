import type { Athlete, ProviderId, ProviderKeys } from "./types";

export const ATHLETES: Athlete[] = [
  // OpenAI
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
  // Anthropic
  {
    id: "anthropic:claude-haiku-3.5",
    name: "Claude Haiku 4.5",
    shortName: "Haiku",
    provider: "anthropic",
    apiModel: "claude-haiku-4-5",
    role: "sprinter",
    inputCostPer1M: 1,
    outputCostPer1M: 5,
    strengths: ["fast classification", "tight prose"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "anthropic:claude-sonnet-4",
    name: "Claude Sonnet 4.6",
    shortName: "Sonnet",
    provider: "anthropic",
    apiModel: "claude-sonnet-4-6",
    role: "allrounder",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    strengths: ["coding", "writing", "careful analysis"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "anthropic:claude-opus-4",
    name: "Claude Opus 4.8",
    shortName: "Opus",
    provider: "anthropic",
    apiModel: "claude-opus-4-8",
    role: "heavy",
    inputCostPer1M: 5,
    outputCostPer1M: 25,
    strengths: ["deep reasoning", "hard engineering"],
    judgeEligible: false,
    classifierEligible: false,
  },
  // Google
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
    id: "google:gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    shortName: "Gemini Pro",
    provider: "google",
    apiModel: "gemini-3.1-pro-preview",
    role: "heavy",
    inputCostPer1M: 2,
    outputCostPer1M: 12,
    strengths: ["analysis", "research", "reasoning"],
    judgeEligible: false,
    classifierEligible: false,
  },
  // DeepSeek
  {
    id: "deepseek:deepseek-chat",
    name: "DeepSeek Chat",
    shortName: "DeepSeek",
    provider: "deepseek",
    apiModel: "deepseek-chat",
    role: "allrounder",
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.1,
    strengths: ["coding", "value", "general Q&A"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "deepseek:deepseek-reasoner",
    name: "DeepSeek Reasoner",
    shortName: "R1",
    provider: "deepseek",
    apiModel: "deepseek-reasoner",
    role: "heavy",
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    strengths: ["chain-of-thought", "math", "logic"],
    judgeEligible: false,
    classifierEligible: false,
  },
  // Groq (Llama)
  {
    id: "groq:llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    shortName: "Llama 3.3",
    provider: "groq",
    apiModel: "llama-3.3-70b-versatile",
    role: "allrounder",
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    strengths: ["open weights", "fast inference", "generalist"],
    judgeEligible: true,
    classifierEligible: false,
  },
  {
    id: "groq:llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    shortName: "Llama 8B",
    provider: "groq",
    apiModel: "llama-3.1-8b-instant",
    role: "sprinter",
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    strengths: ["ultra-fast", "cheap drafts"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "groq:mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    shortName: "Mixtral",
    provider: "groq",
    apiModel: "mixtral-8x7b-32768",
    role: "allrounder",
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    strengths: ["MoE efficiency", "multilingual"],
    judgeEligible: true,
    classifierEligible: false,
  },
  // xAI Grok
  {
    id: "xai:grok-2-1212",
    name: "Grok 2",
    shortName: "Grok 2",
    provider: "xai",
    apiModel: "grok-2-1212",
    role: "allrounder",
    inputCostPer1M: 2,
    outputCostPer1M: 10,
    strengths: ["real-time tone", "general reasoning"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "xai:grok-2-mini",
    name: "Grok 2 Mini",
    shortName: "Grok Mini",
    provider: "xai",
    apiModel: "grok-2-mini",
    role: "sprinter",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.4,
    strengths: ["fast Grok lane", "cheap compare"],
    judgeEligible: true,
    classifierEligible: true,
  },
  // Mistral
  {
    id: "mistral:mistral-small-latest",
    name: "Mistral Small",
    shortName: "M. Small",
    provider: "mistral",
    apiModel: "mistral-small-latest",
    role: "sprinter",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.6,
    strengths: ["EU hosting option", "efficient prose"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "mistral:mistral-large-latest",
    name: "Mistral Large",
    shortName: "M. Large",
    provider: "mistral",
    apiModel: "mistral-large-latest",
    role: "heavy",
    inputCostPer1M: 2,
    outputCostPer1M: 6,
    strengths: ["reasoning", "multilingual", "coding"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "mistral:codestral-latest",
    name: "Codestral",
    shortName: "Codestral",
    provider: "mistral",
    apiModel: "codestral-latest",
    role: "allrounder",
    inputCostPer1M: 0.3,
    outputCostPer1M: 0.9,
    strengths: ["code completion", "refactors"],
    judgeEligible: false,
    classifierEligible: false,
  },
];

export const DEFAULT_SINGLE = "openai:gpt-4o-mini";
export const DEFAULT_COMPARE: [string, string] = [
  "openai:gpt-4o-mini",
  "google:gemini-2.0-flash",
];
export const DEFAULT_PODIUM: string[] = [
  "openai:gpt-4o-mini",
  "openai:gpt-4o",
  "anthropic:claude-haiku-3.5",
  "anthropic:claude-sonnet-4",
  "google:gemini-2.0-flash",
  "google:gemini-2.5-flash",
];

export function getAthlete(id: string): Athlete | undefined {
  const resolved = LEGACY_ATHLETE_IDS[id] ?? id;
  return ATHLETES.find((athlete) => athlete.id === resolved);
}

/** Map retired athlete ids saved in local settings to current catalog entries. */
const LEGACY_ATHLETE_IDS: Record<string, string> = {
  "google:gemini-2.5-pro": "google:gemini-3.1-pro-preview",
};

export function hasKeyForAthlete(keys: ProviderKeys, athleteId: string): boolean {
  const athlete = getAthlete(athleteId);
  if (!athlete) return false;
  return Boolean(keys[athlete.provider]?.trim());
}

/** Replace lanes whose provider has no vault key with models the user can actually call. */
export function reconcilePodiumLanes(
  laneIds: string[],
  keys: ProviderKeys,
  maxLanes = 6,
): string[] {
  const available = athletesForKeys(keys);
  if (available.length === 0) return laneIds.slice(0, maxLanes);

  const kept = laneIds.filter((id) => hasKeyForAthlete(keys, id));
  const used = new Set(kept);

  for (const athlete of available) {
    if (kept.length >= maxLanes) break;
    if (!used.has(athlete.id)) {
      kept.push(athlete.id);
      used.add(athlete.id);
    }
  }

  return kept.slice(0, maxLanes);
}

export function athletesForKeys(keys: ProviderKeys): Athlete[] {
  return ATHLETES.filter((athlete) => Boolean(keys[athlete.provider]?.trim()));
}

export function hasAnyKey(keys: ProviderKeys): boolean {
  return Object.values(keys).some((value) => Boolean(value.trim()));
}

export function keyHeaderName(provider: ProviderId): string {
  return `x-olympiad-${provider}-key`;
}

export function emptyKeys(): ProviderKeys {
  return {
    openai: "",
    anthropic: "",
    google: "",
    deepseek: "",
    groq: "",
    xai: "",
    mistral: "",
  };
}

export function providerLabel(provider: ProviderId): string {
  return {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    deepseek: "DeepSeek",
    groq: "Groq",
    xai: "xAI",
    mistral: "Mistral",
  }[provider];
}

export function mergeKeys(partial: Partial<ProviderKeys>): ProviderKeys {
  return { ...emptyKeys(), ...partial };
}
