import "server-only";

import { getDb } from "@/lib/db";
import { emptyKeys } from "@/lib/models";
import { completeOnce } from "@/lib/providers";
import { buildSupportSystemPrompt, tagSupportMessage } from "@/lib/support-context";
import { appBaseUrl } from "@/lib/app-url";
import type { ProviderKeys } from "@/lib/types";
import { uid } from "@/lib/utils";

const DEFAULT_SUPPORT_ATHLETE = "openai:gpt-4o-mini";
const MAX_THREAD_MESSAGES = 40;
const MAX_MESSAGES_PER_HOUR = 25;

export function supportConfigured(): boolean {
  return Boolean(process.env.SUPPORT_OPENAI_API_KEY?.trim());
}

export function supportAthleteId(): string {
  return process.env.SUPPORT_ATHLETE_ID?.trim() || DEFAULT_SUPPORT_ATHLETE;
}

export function supportNotifyEmail(): string | null {
  return process.env.SUPPORT_NOTIFY_EMAIL?.trim() || null;
}

function supportKeys(): ProviderKeys {
  const openai = process.env.SUPPORT_OPENAI_API_KEY?.trim() ?? "";
  return { ...emptyKeys(), openai };
}

export function getOrCreateThread(input: {
  sessionId: string;
  pagePath?: string;
  visitorEmail?: string | null;
}): { threadId: string; created: boolean } {
  const database = getDb();
  const existing = database
    .prepare(`SELECT id FROM support_threads WHERE visitor_id = ? ORDER BY updated_at DESC LIMIT 1`)
    .get(input.sessionId) as { id: string } | undefined;

  if (existing) {
    database
      .prepare(`UPDATE support_threads SET updated_at = ?, page_path = COALESCE(?, page_path), visitor_email = COALESCE(?, visitor_email) WHERE id = ?`)
      .run(Date.now(), input.pagePath ?? null, input.visitorEmail ?? null, existing.id);
    return { threadId: existing.id, created: false };
  }

  const threadId = uid();
  database
    .prepare(
      `INSERT INTO support_threads (id, visitor_id, visitor_email, page_path, created_at, updated_at, escalated)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
    )
    .run(threadId, input.sessionId, input.visitorEmail ?? null, input.pagePath ?? null, Date.now(), Date.now());
  return { threadId, created: true };
}

export function countRecentSupportMessages(sessionId: string): number {
  const database = getDb();
  const since = Date.now() - 60 * 60 * 1000;
  const row = database
    .prepare(
      `SELECT COUNT(*) AS count
       FROM support_messages m
       JOIN support_threads t ON t.id = m.thread_id
       WHERE t.visitor_id = ? AND m.created_at >= ? AND m.role = 'user'`,
    )
    .get(sessionId, since) as { count: number };
  return row.count;
}

export function countThreadMessages(threadId: string): number {
  const database = getDb();
  const row = database
    .prepare(`SELECT COUNT(*) AS count FROM support_messages WHERE thread_id = ?`)
    .get(threadId) as { count: number };
  return row.count;
}

export function insertSupportMessage(input: {
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tags?: string[];
}) {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO support_messages (id, thread_id, role, content, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(uid(), input.threadId, input.role, input.content, input.tags?.join(",") ?? null, Date.now());
  database.prepare(`UPDATE support_threads SET updated_at = ? WHERE id = ?`).run(Date.now(), input.threadId);
}

export function markThreadEscalated(threadId: string) {
  const database = getDb();
  database.prepare(`UPDATE support_threads SET escalated = 1, updated_at = ? WHERE id = ?`).run(Date.now(), threadId);
}

export async function generateSupportReply(input: {
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
}): Promise<{ reply: string; tags: string[]; suggestEscalate: boolean }> {
  const userTags = tagSupportMessage(input.userMessage);
  const system = buildSupportSystemPrompt(appBaseUrl());
  const messages = [
    { role: "system" as const, content: system },
    ...input.history.slice(-12),
    { role: "user" as const, content: input.userMessage },
  ];

  const reply = await completeOnce(supportAthleteId(), messages, supportKeys());
  const trimmed = reply.trim();
  const assistantTags = tagSupportMessage(trimmed);
  const tags = [...new Set([...userTags, ...assistantTags])];
  const suggestEscalate = tags.includes("escalate");

  return { reply: trimmed, tags, suggestEscalate };
}

export function assertSupportRateLimit(sessionId: string, threadId: string) {
  if (countRecentSupportMessages(sessionId) >= MAX_MESSAGES_PER_HOUR) {
    throw new SupportRateLimitError("Too many support messages this hour. Try again later or use Talk to a human.");
  }
  if (countThreadMessages(threadId) >= MAX_THREAD_MESSAGES) {
    throw new SupportRateLimitError("This support thread is full. Start a new conversation from the chat menu.");
  }
}

export class SupportRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupportRateLimitError";
  }
}

export async function sendSupportEscalationEmail(input: {
  threadId: string;
  visitorEmail?: string | null;
  summary: string;
  pagePath?: string;
}): Promise<{ sent: boolean }> {
  const notify = supportNotifyEmail();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || "AI Olympiad <onboarding@resend.dev>";

  if (!notify || !apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[support] Escalation (${input.threadId}): ${input.summary}`);
    }
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [notify],
      subject: `[Olympiad Support] Escalation ${input.threadId.slice(0, 8)}`,
      html: `<p><strong>Support escalation</strong></p>
<p>Thread: ${input.threadId}</p>
<p>Visitor: ${input.visitorEmail ?? "anonymous"}</p>
<p>Page: ${input.pagePath ?? "unknown"}</p>
<p>${input.summary.replace(/\n/g, "<br/>")}</p>`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 200) || "Failed to send escalation email.");
  }

  return { sent: true };
}
