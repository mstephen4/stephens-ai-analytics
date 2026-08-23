export type ProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "groq"
  | "xai"
  | "mistral";

export type ArenaMode = "single" | "compare" | "podium";

export type LicenseTier = "free" | "single" | "compare" | "pro" | "lifetime";

export type LicenseStatus = "inactive" | "active" | "expired" | "disabled" | "unknown";

export type Intent =
  | "simple_qa"
  | "code"
  | "math"
  | "creative"
  | "analysis"
  | "translation"
  | "summarize";

export type Complexity = "low" | "mid" | "high";

export type ContenderStatus = "idle" | "streaming" | "done" | "false_start" | "dq";

export type Place = 1 | 2 | 3;

export interface Athlete {
  id: string;
  name: string;
  shortName: string;
  provider: ProviderId;
  apiModel: string;
  role: "sprinter" | "allrounder" | "heavy";
  inputCostPer1M: number;
  outputCostPer1M: number;
  strengths: string[];
  judgeEligible: boolean;
  classifierEligible: boolean;
}

export interface ProviderKeys {
  openai: string;
  anthropic: string;
  google: string;
  deepseek: string;
  groq: string;
  xai: string;
  mistral: string;
}

export interface ScoreboardStats {
  generationMs: number;
  tokensPerSec: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface CoachRecommendation {
  athleteId: string;
  justification: string;
  intent: Intent;
  complexity: Complexity;
  source: "heuristic" | "classifier";
}

export interface ContenderResult {
  athleteId: string;
  content: string;
  status: ContenderStatus;
  error?: string;
  stats?: ScoreboardStats;
  place?: Place;
  citation?: string;
}

export interface ArenaMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  athleteId?: string;
  contenders?: ContenderResult[];
  createdAt: number;
}

export interface ArenaEvent {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: ArenaMode;
  messages: ArenaMessage[];
}

export interface LicenseRecord {
  licenseKey: string;
  instanceId: string;
  instanceName: string;
  tier: LicenseTier;
  status: LicenseStatus;
  lastValidatedAt: number;
  expiresAt: string | null;
}

export interface ChatStreamDone {
  type: "done";
  usage: { inputTokens: number; outputTokens: number };
  finishReason?: string;
}

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | ChatStreamDone
  | { type: "error"; code: "FALSE_START" | "DQ"; message: string };
