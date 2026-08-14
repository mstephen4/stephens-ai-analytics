import { buildStats, estimateTokens } from "./cost";
import { readSseStream } from "./sse";
import { keyHeaders } from "./utils";
import type { ChatStreamEvent, ProviderKeys, ScoreboardStats } from "./types";

export async function streamChat(options: {
  athleteId: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  keys: ProviderKeys;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
}): Promise<{ stats: ScoreboardStats; error?: { code: "FALSE_START" | "DQ"; message: string } }> {
  const started = performance.now();
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: keyHeaders(options.keys),
    body: JSON.stringify({
      athleteId: options.athleteId,
      messages: options.messages,
    }),
    signal: options.signal,
  });

  if (!response.ok || !response.body) {
    const message = await response.text();
    return {
      stats: buildStats(options.athleteId, performance.now() - started, 0, 0),
      error: { code: "FALSE_START", message: message || "Proxy false start." },
    };
  }

  let output = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let streamError: { code: "FALSE_START" | "DQ"; message: string } | undefined;

  await readSseStream(response.body, (event: ChatStreamEvent) => {
    if (event.type === "delta") {
      output += event.text;
      options.onDelta(event.text);
    }
    if (event.type === "done") {
      inputTokens = event.usage.inputTokens;
      outputTokens = event.usage.outputTokens;
    }
    if (event.type === "error") {
      streamError = { code: event.code, message: event.message };
    }
  });

  if (!inputTokens) {
    inputTokens = estimateTokens(options.messages.map((m) => m.content).join("\n"));
  }
  if (!outputTokens) {
    outputTokens = estimateTokens(output);
  }

  return {
    stats: buildStats(options.athleteId, performance.now() - started, inputTokens, outputTokens),
    error: streamError,
  };
}
