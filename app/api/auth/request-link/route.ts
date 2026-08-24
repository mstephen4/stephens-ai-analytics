import { sendMagicLinkEmail } from "@/lib/auth/email";
import { appOriginFromRequest } from "@/lib/app-url";
import { createMagicLinkToken, normalizeEmail, purgeExpiredMagicLinks, storeMagicLink } from "@/lib/auth/users";

export const runtime = "nodejs";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = normalizeEmail(body.email ?? "");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Valid email required." }, { status: 400 });
  }

  purgeExpiredMagicLinks();
  const token = createMagicLinkToken();
  storeMagicLink(email, token, MAGIC_LINK_TTL_MS);
  const verifyUrl = `${appOriginFromRequest(request)}/api/auth/verify?token=${encodeURIComponent(token)}`;

  try {
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
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not send email." },
      { status: 502 },
    );
  }
}
