import { randomBytes } from "node:crypto";
import { signData, verifySignedData } from "./signing";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface MagicLinkPayload {
  email: string;
  exp: number;
  nonce: string;
}

export function createSignedMagicLinkToken(email: string, ttlMs: number): string {
  const payload: MagicLinkPayload = {
    email: normalizeEmail(email),
    exp: Date.now() + ttlMs,
    nonce: randomBytes(16).toString("base64url"),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${signData(body)}`;
}

export function consumeSignedMagicLinkToken(token: string): string | null {
  const [body, signature] = token.split(".");
  if (!body || !signature || !verifySignedData(body, signature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as MagicLinkPayload;
    if (!payload.email || !payload.exp) return null;
    if (payload.exp < Date.now()) return null;
    return normalizeEmail(payload.email);
  } catch {
    return null;
  }
}
