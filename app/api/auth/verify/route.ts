import { getTrialDays } from "@/lib/trial";
import { NextResponse } from "next/server";
import { appOriginFromRequest } from "@/lib/app-url";
import { consumeSignedMagicLinkToken } from "@/lib/auth/magic-link";
import { buildSessionCookie, sessionCookieOptions } from "@/lib/auth/session";
import { upsertUserWithTrial, userIdFromEmail } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = appOriginFromRequest(request);
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.redirect(`${origin}/events?auth=missing`);
  }

  const email = consumeSignedMagicLinkToken(token);
  if (!email) {
    return NextResponse.redirect(`${origin}/events?auth=expired`);
  }

  let userId = userIdFromEmail(email);
  let trialEndsAt: number | null = Date.now() + getTrialDays() * 24 * 60 * 60 * 1000;

  try {
    const user = upsertUserWithTrial(email, getTrialDays());
    userId = user.id;
    trialEndsAt = user.trialEndsAt;
  } catch (error) {
    console.error("[auth verify] sqlite unavailable", error);
  }

  const cookieValue = buildSessionCookie(userId, email, trialEndsAt);
  const response = NextResponse.redirect(`${origin}/events?auth=signed-in`);
  response.cookies.set("olympiad_session", cookieValue, sessionCookieOptions(30 * 24 * 60 * 60));
  return response;
}
