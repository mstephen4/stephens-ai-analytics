import type { Athlete, ProviderId, ProviderKeys } from "./types";

export const ATHLETES: Athlete[] = [
  // OpenAI
  {
    id: "openai:gpt-5-nano",
    name: "GPT-5 Nano",
    shortName: "5 Nano",
    provider: "openai",
    apiModel: "gpt-5-nano",
    role: "sprinter",
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.4,
    strengths: ["ultra-cheap", "classification", "short answers"],
    judgeEligible: true,
    classifierEligible: true,
  },
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
    id: "openai:gpt-5-mini",
    name: "GPT-5 Mini",
    shortName: "5 Mini",
    provider: "openai",
    apiModel: "gpt-5-mini",
    role: "sprinter",
    inputCostPer1M: 0.25,
    outputCostPer1M: 2,
    strengths: ["low latency", "instruction following", "tool use"],
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
    id: "openai:gpt-5.2",
    name: "GPT-5.2",
    shortName: "GPT-5.2",
    provider: "openai",
    apiModel: "gpt-5.2",
    role: "allrounder",
    inputCostPer1M: 1.75,
    outputCostPer1M: 14,
    strengths: ["coding", "analysis", "long context"],
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
    id: "openai:gpt-5.2-pro",
    name: "GPT-5.2 Pro",
    shortName: "5.2 Pro",
    provider: "openai",
    apiModel: "gpt-5.2-pro",
    role: "heavy",
    inputCostPer1M: 3.5,
    outputCostPer1M: 14,
    strengths: ["deep reasoning", "hard engineering"],
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
    id: "google:gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    shortName: "G Flash",
    provider: "google",
    apiModel: "gemini-3.6-flash",
    role: "sprinter",
    inputCostPer1M: 1.5,
    outputCostPer1M: 7.5,
    strengths: ["fast agentic loops", "coding", "multimodal"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "google:gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    shortName: "3.5 Flash",
    provider: "google",
    apiModel: "gemini-3.5-flash",
    role: "sprinter",
    inputCostPer1M: 1.25,
    outputCostPer1M: 6,
    strengths: ["high volume", "low latency", "thinking"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "google:gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    shortName: "3.7 Flash",
    provider: "google",
    apiModel: "gemini-3.7-flash",
    role: "allrounder",
    inputCostPer1M: 1.75,
    outputCostPer1M: 8,
    strengths: ["balanced speed", "multimodal", "agents"],
    judgeEligible: true,
    classifierEligible: false,
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
  // Groq
  {
    id: "groq:gpt-oss-20b",
    name: "GPT OSS 20B (Groq)",
    shortName: "OSS 20B",
    provider: "groq",
    apiModel: "openai/gpt-oss-20b",
    role: "sprinter",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.3,
    strengths: ["ultra-fast", "cheap drafts"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "groq:gpt-oss-120b",
    name: "GPT OSS 120B (Groq)",
    shortName: "OSS 120B",
    provider: "groq",
    apiModel: "openai/gpt-oss-120b",
    role: "allrounder",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    strengths: ["open weights", "fast inference", "generalist"],
    judgeEligible: true,
    classifierEligible: false,
  },
  {
    id: "groq:llama-4-scout",
    name: "Llama 4 Scout (Groq)",
    shortName: "L4 Scout",
    provider: "groq",
    apiModel: "meta-llama/llama-4-scout-17b-16e-instruct",
    role: "allrounder",
    inputCostPer1M: 0.11,
    outputCostPer1M: 0.34,
    strengths: ["vision + text", "MoE efficiency"],
    judgeEligible: true,
    classifierEligible: false,
  },
  {
    id: "groq:llama-4-maverick",
    name: "Llama 4 Maverick (Groq)",
    shortName: "L4 Mav",
    provider: "groq",
    apiModel: "meta-llama/llama-4-maverick-17b-128e-instruct",
    role: "heavy",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.6,
    strengths: ["multimodal", "128k context"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "groq:qwen3-32b",
    name: "Qwen3 32B (Groq)",
    shortName: "Qwen3",
    provider: "groq",
    apiModel: "qwen/qwen3-32b",
    role: "allrounder",
    inputCostPer1M: 0.29,
    outputCostPer1M: 0.59,
    strengths: ["multilingual", "reasoning", "tool use"],
    judgeEligible: true,
    classifierEligible: false,
  },
  // xAI Grok
  {
    id: "xai:grok-4-fast-non-reasoning",
    name: "Grok 4 Fast",
    shortName: "Grok Fast",
    provider: "xai",
    apiModel: "grok-4-fast-non-reasoning",
    role: "sprinter",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.5,
    strengths: ["2M context", "low latency", "cheap compare"],
    judgeEligible: true,
    classifierEligible: true,
  },
  {
    id: "xai:grok-4-fast-reasoning",
    name: "Grok 4 Fast (Reasoning)",
    shortName: "Grok R",
    provider: "xai",
    apiModel: "grok-4-fast-reasoning",
    role: "allrounder",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.5,
    strengths: ["reasoning", "long context", "general tasks"],
    judgeEligible: false,
    classifierEligible: false,
  },
  {
    id: "xai:grok-4.6",
    name: "Grok 4.6",
    shortName: "Grok 4.6",
    provider: "xai",
    apiModel: "grok-4.6",
    role: "heavy",
    inputCostPer1M: 2,
    outputCostPer1M: 6,
    strengths: ["flagship reasoning", "coding", "agents"],
    judgeEligible: false,
    classifierEligible: false,
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
  {
    id: "mistral:mistral-medium-latest",
    name: "Mistral Medium",
    shortName: "M. Med",
    provider: "mistral",
    apiModel: "mistral-medium-latest",
    role: "allrounder",
    inputCostPer1M: 0.4,
    outputCostPer1M: 2,
    strengths: ["balanced quality", "multilingual"],
    judgeEligible: false,
    classifierEligible: false,
  },
];

export const DEFAULT_SINGLE = "openai:gpt-4o-mini";
export const DEFAULT_COMPARE: [string, string] = [
  "openai:gpt-5-mini",
  "google:gemini-3.6-flash",
];
export const DEFAULT_PODIUM: string[] = [
  "openai:gpt-5-mini",
  "openai:gpt-4o",
  "anthropic:claude-haiku-3.5",
  "anthropic:claude-sonnet-4",
  "google:gemini-3.6-flash",
  "google:gemini-3.1-pro-preview",
  "groq:gpt-oss-20b",
  "xai:grok-4-fast-non-reasoning",
  "deepseek:deepseek-chat",
  "mistral:mistral-small-latest",
];

/** Map retired athlete ids saved in local settings to current catalog entries. */
const LEGACY_ATHLETE_IDS: Record<string, string> = {
  "google:gemini-2.0-flash": "google:gemini-3.6-flash",
  "google:gemini-2.5-flash": "google:gemini-3.6-flash",
  "google:gemini-2.5-pro": "google:gemini-3.1-pro-preview",
  "groq:mixtral-8x7b-32768": "groq:gpt-oss-120b",
  "groq:llama-3.1-8b-instant": "groq:gpt-oss-20b",
  "groq:llama-3.3-70b-versatile": "groq:gpt-oss-120b",
  "xai:grok-2-1212": "xai:grok-4.6",
  "xai:grok-2-mini": "xai:grok-4-fast-non-reasoning",
  "openai:o4-mini": "openai:gpt-5-mini",
};

export function getAthlete(id: string): Athlete | undefined {
  const resolved = LEGACY_ATHLETE_IDS[id] ?? id;
  return ATHLETES.find((athlete) => athlete.id === resolved);
}

export function hasKeyForAthlete(keys: ProviderKeys, athleteId: string): boolean {
  const athlete = getAthlete(athleteId);
  if (!athlete) return false;
  return Boolean(keys[athlete.provider]?.trim());
}

export function activeLaneIds(laneIds: string[]): string[] {
  return laneIds.filter((id) => id.trim().length > 0);
}

/** Pick which lane slot should receive a Coach recommendation. */
export function laneIndexForCoachPick(laneIds: string[], athleteId: string): number {
  const existing = laneIds.findIndex((id) => id === athleteId);
  if (existing >= 0) return existing;
  const empty = laneIds.findIndex((id) => !id.trim());
  if (empty >= 0) return empty;
  return 0;
}

/** Replace lanes whose provider has no vault key; preserve intentionally empty slots. */
export function reconcilePodiumLanes(
  laneIds: string[],
  keys: ProviderKeys,
  maxLanes = 6,
): string[] {
  const available = athletesForKeys(keys);
  const trimmed = laneIds.slice(0, maxLanes);
  if (available.length === 0) return trimmed;

  const used = new Set(
    trimmed.filter((id) => id && hasKeyForAthlete(keys, id)),
  );
  const result: string[] = [];

  for (const id of trimmed) {
    if (!id) {
      result.push("");
      continue;
    }
    if (hasKeyForAthlete(keys, id)) {
      result.push(id);
      used.add(id);
      continue;
    }
    const replacement = available.find((athlete) => !used.has(athlete.id));
    if (replacement) {
      result.push(replacement.id);
      used.add(replacement.id);
    } else {
      result.push("");
    }
  }

  return result;
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
