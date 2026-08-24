import { cookies } from "next/headers";
import { signData, verifySignedData } from "./signing";

export const SESSION_COOKIE = "olympiad_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
  trialEndsAt?: number | null;
}

export function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signData(body);
  return `${body}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature || !verifySignedData(body, signature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !payload.email || !payload.exp) return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildSessionCookie(
  userId: string,
  email: string,
  trialEndsAt: number | null = null,
): string {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
    trialEndsAt,
  };
  return encodeSession(payload);
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}
