import type { ProviderId } from "./types";

export type StarterProviderId = "google" | "groq" | "openai";

export interface ProviderGuide {
  id: StarterProviderId;
  label: string;
  tagline: string;
  keyUrl: string;
  docsUrl: string;
  testAthleteId: string;
  steps: string[];
  costNote: string;
}

export const STARTER_PROVIDERS: ProviderGuide[] = [
  {
    id: "google",
    label: "Google Gemini",
    tagline: "Best first key — generous free tier, one key covers Flash and Pro lanes.",
    keyUrl: "https://aistudio.google.com/apikey",
    docsUrl: "https://ai.google.dev/gemini-api/docs/api-key",
    testAthleteId: "google:gemini-3.6-flash",
    steps: [
      "Open Google AI Studio and sign in with your Google account.",
      "Click Create API key and copy the key (starts with AI…).",
      "Paste it below and tap Test key, then Save vault.",
    ],
    costNote: "Many Flash compare events cost well under $0.01.",
  },
  {
    id: "groq",
    label: "Groq",
    tagline: "Ultra-fast open models — great for snappy compare demos.",
    keyUrl: "https://console.groq.com/keys",
    docsUrl: "https://console.groq.com/docs/quickstart",
    testAthleteId: "groq:llama-3.1-8b-instant",
    steps: [
      "Create a free Groq Cloud account.",
      "Open API Keys and create a key (starts with gsk_…).",
      "Paste it below and tap Test key, then Save vault.",
    ],
    costNote: "Llama 8B on Groq is among the cheapest lanes in the roster.",
  },
  {
    id: "openai",
    label: "OpenAI",
    tagline: "The familiar choice — GPT-4o Mini is cheap and judge-eligible.",
    keyUrl: "https://platform.openai.com/api-keys",
    docsUrl: "https://platform.openai.com/docs/quickstart",
    testAthleteId: "openai:gpt-4o-mini",
    steps: [
      "Sign in to the OpenAI platform and add billing if prompted.",
      "Create a new secret key (starts with sk-…).",
      "Paste it below and tap Test key, then Save vault.",
    ],
    costNote: "GPT-4o Mini is priced for high-volume Q&A and judging.",
  },
];

export const TEST_ATHLETE_BY_PROVIDER: Partial<Record<ProviderId, string>> = {
  google: "google:gemini-3.6-flash",
  groq: "groq:llama-3.1-8b-instant",
  openai: "openai:gpt-4o-mini",
  anthropic: "anthropic:claude-haiku-3.5",
  deepseek: "deepseek:deepseek-chat",
  xai: "xai:grok-2-mini",
  mistral: "mistral:mistral-small-latest",
};

export function getStarterGuide(id: StarterProviderId): ProviderGuide {
  return STARTER_PROVIDERS.find((guide) => guide.id === id) ?? STARTER_PROVIDERS[0];
}
