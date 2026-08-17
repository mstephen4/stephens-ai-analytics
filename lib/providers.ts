import { getAthlete } from "./models";
import { encodeSse } from "./sse";
import type { ChatStreamEvent, ProviderId, ProviderKeys } from "./types";

const REQUEST_TIMEOUT_MS = 120_000;

export class ProviderError extends Error {
  code: "FALSE_START" | "DQ";
  constructor(code: "FALSE_START" | "DQ", message: string) {
    super(message);
    this.code = code;
  }
}

export function keysFromHeaders(headers: Headers): ProviderKeys {
  const read = (provider: keyof ProviderKeys) =>
    headers.get(`x-olympiad-${provider}-key`)?.trim() ||
    headers.get(`x-arena-${provider}-key`)?.trim() ||
    "";
  return {
    openai: read("openai"),
    anthropic: read("anthropic"),
    google: read("google"),
    deepseek: read("deepseek"),
    groq: read("groq"),
    xai: read("xai"),
    mistral: read("mistral"),
  };
}

export function keyForProvider(keys: ProviderKeys, provider: ProviderId): string {
  const key = keys[provider];
  if (!key) {
    throw new ProviderError("DQ", `No ${provider} key in the vault for this athlete.`);
  }
  return key;
}

function classifyHttpError(status: number, body: string): ProviderError {
  if (status === 401 || status === 403) {
    return new ProviderError("DQ", "Broken key — the provider rejected the vault credential.");
  }
  if (status === 429) {
    return new ProviderError("FALSE_START", "Lane congestion — provider rate limit hit.");
  }
  if (/content.?filter|safety|moderation|refused/i.test(body)) {
    return new ProviderError("DQ", "Content filter rejection.");
  }
  return new ProviderError("FALSE_START", body.slice(0, 280) || `Provider error ${status}`);
}

async function fetchProvider(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ProviderError("FALSE_START", "Timeout — the athlete never left the blocks.");
    }
    throw new ProviderError("FALSE_START", "Network false start reaching the provider.");
  } finally {
    clearTimeout(timer);
  }
}

export async function completeOnce(
  athleteId: string,
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  keys: ProviderKeys,
): Promise<string> {
  const chunks: string[] = [];
  await streamAthlete(athleteId, messages, keys, (event) => {
    if (event.type === "delta") chunks.push(event.text);
    if (event.type === "error") {
      throw new ProviderError(event.code, event.message);
    }
  });
  return chunks.join("");
}

export async function streamAthlete(
  athleteId: string,
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  keys: ProviderKeys,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const athlete = getAthlete(athleteId);
  if (!athlete) {
    onEvent({ type: "error", code: "DQ", message: "Unknown athlete." });
    return;
  }
  try {
    const key = keyForProvider(keys, athlete.provider);
    if (athlete.provider === "openai") {
      await streamOpenAI("https://api.openai.com/v1/chat/completions", athlete.apiModel, messages, key, onEvent);
    } else if (athlete.provider === "anthropic") {
      await streamAnthropic(athlete.apiModel, messages, key, onEvent);
    } else if (athlete.provider === "google") {
      await streamGoogle(athlete.apiModel, messages, key, onEvent);
    } else if (athlete.provider === "deepseek") {
      await streamOpenAI("https://api.deepseek.com/v1/chat/completions", athlete.apiModel, messages, key, onEvent);
    } else if (athlete.provider === "groq") {
      await streamOpenAI("https://api.groq.com/openai/v1/chat/completions", athlete.apiModel, messages, key, onEvent);
    } else if (athlete.provider === "xai") {
      await streamOpenAI("https://api.x.ai/v1/chat/completions", athlete.apiModel, messages, key, onEvent);
    } else {
      await streamOpenAI("https://api.mistral.ai/v1/chat/completions", athlete.apiModel, messages, key, onEvent);
    }
  } catch (error) {
    const mapped =
      error instanceof ProviderError
        ? error
        : new ProviderError("FALSE_START", error instanceof Error ? error.message : "Unknown false start.");
    onEvent({ type: "error", code: mapped.code, message: mapped.message });
  }
}

export function providerStreamResponse(
  athleteId: string,
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  keys: ProviderKeys,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        controller.enqueue(encoder.encode(encodeSse(event)));
      };
      await streamAthlete(athleteId, messages, keys, send);
      controller.close();
    },
  });
}

async function streamOpenAI(
  endpoint: string,
  model: string,
  messages: { role: string; content: string }[],
  apiKey: string,
  onEvent: (event: ChatStreamEvent) => void,
) {
  const response = await fetchProvider(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      stream_options: { include_usage: true },
      messages,
    }),
  });
  if (!response.ok) {
    throw classifyHttpError(response.status, await response.text());
  }
  if (!response.body) throw new ProviderError("FALSE_START", "Empty stream from OpenAI.");

  let inputTokens = 0;
  let outputTokens = 0;
  let finishReason: string | undefined;
  await iterateSse(response.body, (payload) => {
    if (payload === "[DONE]") return;
    const json = JSON.parse(payload) as {
      choices?: { delta?: { content?: string }; finish_reason?: string }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const delta = json.choices?.[0]?.delta?.content;
    if (delta) onEvent({ type: "delta", text: delta });
    const reason = json.choices?.[0]?.finish_reason;
    if (reason) finishReason = reason;
    if (json.usage) {
      inputTokens = json.usage.prompt_tokens ?? inputTokens;
      outputTokens = json.usage.completion_tokens ?? outputTokens;
    }
  });
  if (finishReason === "content_filter") {
    onEvent({ type: "error", code: "DQ", message: "Content filter rejection." });
    return;
  }
  onEvent({
    type: "done",
    usage: { inputTokens, outputTokens },
    finishReason,
  });
}

async function streamAnthropic(
  model: string,
  messages: { role: string; content: string }[],
  apiKey: string,
  onEvent: (event: ChatStreamEvent) => void,
) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const converted = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
  const response = await fetchProvider("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      system: system || undefined,
      messages: converted,
    }),
  });
  if (!response.ok) {
    throw classifyHttpError(response.status, await response.text());
  }
  if (!response.body) throw new ProviderError("FALSE_START", "Empty stream from Anthropic.");

  let inputTokens = 0;
  let outputTokens = 0;
  await iterateSse(response.body, (payload) => {
    const json = JSON.parse(payload) as {
      type?: string;
      delta?: { type?: string; text?: string };
      message?: { usage?: { input_tokens?: number; output_tokens?: number } };
      usage?: { input_tokens?: number; output_tokens?: number };
      error?: { message?: string };
    };
    if (json.type === "content_block_delta" && json.delta?.text) {
      onEvent({ type: "delta", text: json.delta.text });
    }
    if (json.type === "message_start") {
      inputTokens = json.message?.usage?.input_tokens ?? inputTokens;
    }
    if (json.type === "message_delta" && json.usage) {
      outputTokens = json.usage.output_tokens ?? outputTokens;
    }
    if (json.type === "error") {
      throw new ProviderError("DQ", json.error?.message || "Anthropic error.");
    }
  });
  onEvent({ type: "done", usage: { inputTokens, outputTokens } });
}

async function streamGoogle(
  model: string,
  messages: { role: string; content: string }[],
  apiKey: string,
  onEvent: (event: ChatStreamEvent) => void,
) {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const response = await fetchProvider(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!response.ok) {
    throw classifyHttpError(response.status, await response.text());
  }
  if (!response.body) throw new ProviderError("FALSE_START", "Empty stream from Google.");

  let inputTokens = 0;
  let outputTokens = 0;
  let safety = false;
  await iterateSse(response.body, (payload) => {
    const json = JSON.parse(payload) as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
        finishReason?: string;
      }[];
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };
    const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
    if (text) onEvent({ type: "delta", text });
    if (json.candidates?.[0]?.finishReason === "SAFETY") safety = true;
    if (json.usageMetadata) {
      inputTokens = json.usageMetadata.promptTokenCount ?? inputTokens;
      outputTokens = json.usageMetadata.candidatesTokenCount ?? outputTokens;
    }
  });
  if (safety) {
    onEvent({ type: "error", code: "DQ", message: "Content filter rejection." });
    return;
  }
  onEvent({ type: "done", usage: { inputTokens, outputTokens } });
}

async function iterateSse(
  stream: ReadableStream<Uint8Array>,
  onPayload: (payload: string) => void,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const data = part
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("");
      if (!data) continue;
      onPayload(data);
    }
  }
  if (buffer.trim()) {
    const data = buffer
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("");
    if (data) onPayload(data);
  }
}
