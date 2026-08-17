import { mergeKeys } from "./models";
import type { ProviderKeys } from "./types";

export function uid(): string {
  return crypto.randomUUID();
}

export function keyHeaders(keys: ProviderKeys): HeadersInit {
  const merged = mergeKeys(keys);
  return {
    "Content-Type": "application/json",
    "x-olympiad-openai-key": merged.openai,
    "x-olympiad-anthropic-key": merged.anthropic,
    "x-olympiad-google-key": merged.google,
    "x-olympiad-deepseek-key": merged.deepseek,
    "x-olympiad-groq-key": merged.groq,
    "x-olympiad-xai-key": merged.xai,
    "x-olympiad-mistral-key": merged.mistral,
    // Legacy headers for in-flight sessions during migration
    "x-arena-openai-key": merged.openai,
    "x-arena-anthropic-key": merged.anthropic,
    "x-arena-google-key": merged.google,
  };
}

export function titleFromPrompt(prompt: string): string {
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (!compact) return "Untitled Event";
  return compact.length > 52 ? `${compact.slice(0, 52)}…` : compact;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
