import { describe, expect, it } from "vitest";
import { eachSseDataPayload } from "@/lib/sse";

describe("eachSseDataPayload", () => {
  it("returns each data line separately instead of concatenating JSON", () => {
    const block = [
      'data: {"candidates":[{"content":{"parts":[{"text":"Hello"}]}}]}',
      'data: {"candidates":[{"content":{"parts":[{"text":" world"}]}}]}',
    ].join("\n");

    const payloads = eachSseDataPayload(block);
    expect(payloads).toHaveLength(2);
    expect(JSON.parse(payloads[0]).candidates[0].content.parts[0].text).toBe("Hello");
    expect(JSON.parse(payloads[1]).candidates[0].content.parts[0].text).toBe(" world");
  });

  it("skips empty data lines and [DONE]", () => {
    const block = "data:\ndata: [DONE]\ndata: {\"ok\":true}";
    expect(eachSseDataPayload(block)).toEqual(['{"ok":true}']);
  });

  it("handles single-line SSE events", () => {
    const block = 'data: {"type":"delta","text":"hi"}';
    expect(eachSseDataPayload(block)).toEqual(['{"type":"delta","text":"hi"}']);
  });
});
