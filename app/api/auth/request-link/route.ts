import { sendMagicLinkEmail } from "@/lib/auth/email";
import { createSignedMagicLinkToken } from "@/lib/auth/magic-link";
import { appOriginFromRequest } from "@/lib/app-url";
import { normalizeEmail } from "@/lib/auth/users";

export const runtime = "nodejs";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, error: "Valid email required." }, { status: 400 });
    }

    const token = createSignedMagicLinkToken(email, MAGIC_LINK_TTL_MS);
    const verifyUrl = `${appOriginFromRequest(request)}/api/auth/verify?token=${encodeURIComponent(token)}`;

    const mail = await sendMagicLinkEmail(email, verifyUrl);
    return Response.json({
      ok: true,
      sent: mail.sent,
      devLink: mail.devLink,
      message: mail.sent
        ? "Check your email for a sign-in link."
        : mail.devLink
          ? "Development mode: use the link below to sign in."
          : "Sign-in link created.",
    });
  } catch (error) {
    console.error("[auth request-link]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not send sign-in link.",
      },
      { status: 500 },
    );
  }
}
