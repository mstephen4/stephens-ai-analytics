import { keysFromHeaders, providerStreamResponse } from "@/lib/providers";
import { createSseResponse, encodeSse } from "@/lib/sse";
import { getAthlete } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  try {
    const body = (await request.json()) as {
      athleteId?: string;
      messages?: { role: "user" | "assistant" | "system"; content: string }[];
    };
    const athleteId = body.athleteId?.trim();
    const messages = body.messages ?? [];
    if (!athleteId || !getAthlete(athleteId)) {
      return Response.json({ error: "Unknown athlete." }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages required." }, { status: 400 });
    }
    const keys = keysFromHeaders(request.headers);
    return createSseResponse(providerStreamResponse(athleteId, messages, keys));
  } catch (error) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "error",
              code: "FALSE_START",
              message: error instanceof Error ? error.message : "Proxy false start.",
            }),
          ),
        );
        controller.close();
      },
    });
    return createSseResponse(stream);
  }
}
