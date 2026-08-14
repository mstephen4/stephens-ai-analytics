import type { ChatStreamEvent, ProviderId } from "./types";

export function encodeSse(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function createSseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function readSseStream(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .filter((entry) => entry.startsWith("data:"))
        .map((entry) => entry.slice(5).trim())
        .join("");
      if (!line || line === "[DONE]") continue;
      try {
        onEvent(JSON.parse(line) as ChatStreamEvent);
      } catch {
        // ignore malformed keep-alives
      }
    }
  }
}

export function providerFromAthleteId(id: string): ProviderId {
  const [provider] = id.split(":");
  if (provider === "openai" || provider === "anthropic" || provider === "google") {
    return provider;
  }
  throw new Error(`Unknown provider in athlete id: ${id}`);
}
