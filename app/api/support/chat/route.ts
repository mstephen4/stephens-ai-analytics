import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";
import { tagSupportMessage } from "@/lib/support-context";
import {
  assertSupportRateLimit,
  generateSupportReply,
  getOrCreateThread,
  insertSupportMessage,
  supportConfigured,
  SupportRateLimitError,
} from "@/lib/support-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!supportConfigured()) {
    return Response.json(
      { ok: false, error: "Support chat is not configured on this server." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    sessionId?: string;
    message?: string;
    history?: { role: "user" | "assistant"; content: string }[];
    pagePath?: string;
  };

  const sessionId = body.sessionId?.trim();
  const message = body.message?.trim();
  if (!sessionId || !message) {
    return Response.json({ ok: false, error: "Session and message are required." }, { status: 400 });
  }
  if (message.length > 4000) {
    return Response.json({ ok: false, error: "Message is too long." }, { status: 400 });
  }

  const session = await readSession();
  const visitorEmail = session ? getUserById(session.userId)?.email : null;
  const { threadId } = getOrCreateThread({
    sessionId,
    pagePath: body.pagePath,
    visitorEmail,
  });

  try {
    assertSupportRateLimit(sessionId, threadId);
  } catch (error) {
    if (error instanceof SupportRateLimitError) {
      return Response.json({ ok: false, error: error.message }, { status: 429 });
    }
    throw error;
  }

  const history = Array.isArray(body.history)
    ? body.history.filter((entry) => entry.role === "user" || entry.role === "assistant")
    : [];

  insertSupportMessage({ threadId, role: "user", content: message, tags: tagSupportMessage(message) });

  try {
    const { reply, tags, suggestEscalate } = await generateSupportReply({
      history,
      userMessage: message,
    });

    insertSupportMessage({ threadId, role: "assistant", content: reply, tags });

    return Response.json({
      ok: true,
      threadId,
      reply,
      tags,
      suggestEscalate,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Support assistant unavailable.";
    return Response.json({ ok: false, error: errMessage }, { status: 502 });
  }
}
