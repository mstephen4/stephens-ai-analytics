import { createHmac, timingSafeEqual } from "node:crypto";

export function authSecret(): string {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is required in production.");
    }
    return "dev-insecure-auth-secret-change-me";
  }
  return value;
}

export function signData(data: string): string {
  return createHmac("sha256", authSecret()).update(data).digest("base64url");
}

export function verifySignedData(body: string, signature: string): boolean {
  const expected = signData(body);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
