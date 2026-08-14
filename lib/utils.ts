import type { ProviderKeys } from "./types";

export function uid(): string {
  return crypto.randomUUID();
}

export function keyHeaders(keys: ProviderKeys): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-arena-openai-key": keys.openai,
    "x-arena-anthropic-key": keys.anthropic,
    "x-arena-google-key": keys.google,
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
