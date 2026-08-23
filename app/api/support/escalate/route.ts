import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";
import {
  getOrCreateThread,
  insertSupportMessage,
  markThreadEscalated,
  sendSupportEscalationEmail,
  supportConfigured,
} from "@/lib/support-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sessionId?: string;
    message?: string;
    email?: string;
    pagePath?: string;
  };

  const sessionId = body.sessionId?.trim();
  const message = body.message?.trim();
  if (!sessionId || !message) {
    return Response.json({ ok: false, error: "Session and message are required." }, { status: 400 });
  }

  const session = await readSession();
  const signedInEmail = session ? getUserById(session.userId)?.email : null;
  const visitorEmail = body.email?.trim() || signedInEmail || null;

  const { threadId } = getOrCreateThread({
    sessionId,
    pagePath: body.pagePath,
    visitorEmail,
  });

  insertSupportMessage({
    threadId,
    role: "user",
    content: `[Human escalation request] ${message}`,
    tags: ["escalate"],
  });
  markThreadEscalated(threadId);

  let emailed = false;
  if (supportConfigured()) {
    try {
      const result = await sendSupportEscalationEmail({
        threadId,
        visitorEmail,
        summary: message,
        pagePath: body.pagePath,
      });
      emailed = result.sent;
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Could not send escalation email.";
      return Response.json({ ok: false, error: errMessage }, { status: 502 });
    }
  }

  return Response.json({
    ok: true,
    threadId,
    emailed,
    message: emailed
      ? "Thanks — a human will follow up by email."
      : "Request logged. For billing help, email the address on your Stripe receipt.",
  });
}
