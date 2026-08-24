import { getTrialDays } from "@/lib/trial";
import { NextResponse } from "next/server";
import { appOriginFromRequest } from "@/lib/app-url";
import { buildSessionCookie, sessionCookieOptions } from "@/lib/auth/session";
import { consumeMagicLink, upsertUserWithTrial } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.redirect(`${appOriginFromRequest(request)}/events?auth=missing`);
  }

  const email = consumeMagicLink(token);
  if (!email) {
    return NextResponse.redirect(`${appOriginFromRequest(request)}/events?auth=expired`);
  }

  const user = upsertUserWithTrial(email, getTrialDays());
  const cookieValue = buildSessionCookie(user.id, user.email);
  const response = NextResponse.redirect(`${appOriginFromRequest(request)}/events?auth=signed-in`);
  response.cookies.set("olympiad_session", cookieValue, sessionCookieOptions(30 * 24 * 60 * 60));
  return response;
}
