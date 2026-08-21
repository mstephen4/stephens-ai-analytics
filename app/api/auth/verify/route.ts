import { getTrialDays } from "@/lib/trial";
import { NextResponse } from "next/server";
import { buildSessionCookie, sessionCookieOptions } from "@/lib/auth/session";
import { consumeMagicLink, upsertUserWithTrial } from "@/lib/auth/users";

export const runtime = "nodejs";

function appOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    request.headers.get("origin")?.trim() ||
    "http://localhost:3000"
  );
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.redirect(`${appOrigin(request)}/events?auth=missing`);
  }

  const email = consumeMagicLink(token);
  if (!email) {
    return NextResponse.redirect(`${appOrigin(request)}/events?auth=expired`);
  }

  const user = upsertUserWithTrial(email, getTrialDays());
  const cookieValue = buildSessionCookie(user.id, user.email);
  const response = NextResponse.redirect(`${appOrigin(request)}/events?auth=signed-in`);
  response.cookies.set("olympiad_session", cookieValue, sessionCookieOptions(30 * 24 * 60 * 60));
  return response;
}
