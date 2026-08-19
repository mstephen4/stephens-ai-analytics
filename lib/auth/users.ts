import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function createMagicLinkToken(): string {
  return randomBytes(32).toString("base64url");
}

export function storeMagicLink(email: string, token: string, ttlMs: number) {
  const database = getDb();
  const expiresAt = Date.now() + ttlMs;
  database
    .prepare(
      `INSERT INTO magic_links (token_hash, email, expires_at) VALUES (?, ?, ?)
       ON CONFLICT(token_hash) DO UPDATE SET email = excluded.email, expires_at = excluded.expires_at`,
    )
    .run(hashToken(token), normalizeEmail(email), expiresAt);
  return expiresAt;
}

export function consumeMagicLink(token: string): string | null {
  const database = getDb();
  const tokenHash = hashToken(token);
  const row = database
    .prepare(`SELECT email, expires_at FROM magic_links WHERE token_hash = ?`)
    .get(tokenHash) as { email: string; expires_at: number } | undefined;
  if (!row || row.expires_at < Date.now()) {
    database.prepare(`DELETE FROM magic_links WHERE token_hash = ?`).run(tokenHash);
    return null;
  }
  database.prepare(`DELETE FROM magic_links WHERE token_hash = ?`).run(tokenHash);
  return row.email;
}

export function purgeExpiredMagicLinks() {
  getDb().prepare(`DELETE FROM magic_links WHERE expires_at < ?`).run(Date.now());
}

export interface DbUser {
  id: string;
  email: string;
  trialStartedAt: number | null;
  trialEndsAt: number | null;
  createdAt: number;
}

export function getUserById(id: string): DbUser | null {
  const row = getDb()
    .prepare(`SELECT id, email, trial_started_at, trial_ends_at, created_at FROM users WHERE id = ?`)
    .get(id) as
    | {
        id: string;
        email: string;
        trial_started_at: number | null;
        trial_ends_at: number | null;
        created_at: number;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    trialStartedAt: row.trial_started_at,
    trialEndsAt: row.trial_ends_at,
    createdAt: row.created_at,
  };
}

export function getUserByEmail(email: string): DbUser | null {
  const row = getDb()
    .prepare(
      `SELECT id, email, trial_started_at, trial_ends_at, created_at FROM users WHERE email = ? COLLATE NOCASE`,
    )
    .get(normalizeEmail(email)) as
    | {
        id: string;
        email: string;
        trial_started_at: number | null;
        trial_ends_at: number | null;
        created_at: number;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    trialStartedAt: row.trial_started_at,
    trialEndsAt: row.trial_ends_at,
    createdAt: row.created_at,
  };
}

export function upsertUserWithTrial(email: string, trialDays: number): DbUser {
  const database = getDb();
  const normalized = normalizeEmail(email);
  const existing = getUserByEmail(normalized);
  const now = Date.now();
  if (existing) return existing;

  const id = randomBytes(16).toString("hex");
  const trialEndsAt = now + trialDays * 24 * 60 * 60 * 1000;
  database
    .prepare(
      `INSERT INTO users (id, email, trial_started_at, trial_ends_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(id, normalized, now, trialEndsAt, now);
  return {
    id,
    email: normalized,
    trialStartedAt: now,
    trialEndsAt,
    createdAt: now,
  };
}

export function startTrialForUser(userId: string, trialDays: number): DbUser | null {
  const user = getUserById(userId);
  if (!user) return null;
  if (user.trialEndsAt && user.trialEndsAt > Date.now()) return user;
  const now = Date.now();
  const trialEndsAt = now + trialDays * 24 * 60 * 60 * 1000;
  getDb()
    .prepare(`UPDATE users SET trial_started_at = ?, trial_ends_at = ? WHERE id = ?`)
    .run(now, trialEndsAt, userId);
  return getUserById(userId);
}

export function upsertLicenseByEmail(email: string, licenseKey: string, tier: string, status = "active") {
  getDb()
    .prepare(
      `INSERT INTO license_by_email (email, license_key, tier, status, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         license_key = excluded.license_key,
         tier = excluded.tier,
         status = excluded.status,
         updated_at = excluded.updated_at`,
    )
    .run(normalizeEmail(email), licenseKey, tier, status, Date.now());
}

export function getLicenseByEmail(email: string) {
  return getDb()
    .prepare(`SELECT license_key, tier, status FROM license_by_email WHERE email = ? COLLATE NOCASE`)
    .get(normalizeEmail(email)) as { license_key: string; tier: string; status: string } | undefined;
}

export function linkUserLicense(userId: string, licenseKey: string, instanceId?: string) {
  getDb()
    .prepare(
      `INSERT INTO user_license_keys (user_id, license_key, instance_id, linked_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, license_key) DO UPDATE SET instance_id = excluded.instance_id, linked_at = excluded.linked_at`,
    )
    .run(userId, licenseKey, instanceId ?? null, Date.now());
}

export function getLinkedLicenseKeys(userId: string): string[] {
  const rows = getDb()
    .prepare(`SELECT license_key FROM user_license_keys WHERE user_id = ?`)
    .all(userId) as { license_key: string }[];
  return rows.map((row) => row.license_key);
}
