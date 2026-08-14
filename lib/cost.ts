import { getAthlete } from "./models";
import type { ScoreboardStats } from "./types";

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function usdCost(
  athleteId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const athlete = getAthlete(athleteId);
  if (!athlete) return 0;
  return (
    (inputTokens / 1_000_000) * athlete.inputCostPer1M +
    (outputTokens / 1_000_000) * athlete.outputCostPer1M
  );
}

export function formatUsd(amount: number): string {
  if (amount <= 0) return "$0.000";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(3)}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function buildStats(
  athleteId: string,
  generationMs: number,
  inputTokens: number,
  outputTokens: number,
): ScoreboardStats {
  const seconds = Math.max(generationMs / 1000, 0.001);
  return {
    generationMs,
    tokensPerSec: Math.round((outputTokens / seconds) * 10) / 10,
    inputTokens,
    outputTokens,
    costUsd: usdCost(athleteId, inputTokens, outputTokens),
  };
}
