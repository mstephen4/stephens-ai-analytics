"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SupportMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SESSION_KEY = "olympiad.supportSession";

function loadSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateEmail, setEscalateEmail] = useState("");
  const [escalateMessage, setEscalateMessage] = useState("");
  const [escalateBusy, setEscalateBusy] = useState(false);
  const [escalateNote, setEscalateNote] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef("");

  useEffect(() => {
    sessionIdRef.current = loadSessionId();
    void fetch("/api/support/status", { cache: "no-store" })
      .then(async (response) => {
        const json = (await response.json()) as { enabled?: boolean };
        setEnabled(Boolean(json.enabled));
      })
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || busy || !enabled) return;

    const userMessage: SupportMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: trimmed,
          pagePath: pathname,
          history: messages.map((message) => ({ role: message.role, content: message.content })),
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        reply?: string;
        error?: string;
        suggestEscalate?: boolean;
      };
      if (!json.ok || !json.reply) {
        throw new Error(json.error || "Support assistant unavailable.");
      }
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: json.reply ?? "" },
      ]);
      if (json.suggestEscalate) setEscalateOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reach support.");
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, input, messages, pathname]);

  const submitEscalation = useCallback(async () => {
    const trimmed = escalateMessage.trim();
    if (!trimmed || escalateBusy) return;
    setEscalateBusy(true);
    setEscalateNote(null);
    try {
      const response = await fetch("/api/support/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          email: escalateEmail.trim() || undefined,
          message: trimmed,
          pagePath: pathname,
        }),
      });
      const json = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!json.ok) throw new Error(json.error || "Escalation failed.");
      setEscalateNote(json.message ?? "Request sent.");
      setEscalateMessage("");
      setEscalateOpen(false);
    } catch (err: unknown) {
      setEscalateNote(err instanceof Error ? err.message : "Escalation failed.");
    } finally {
      setEscalateBusy(false);
    }
  }, [escalateBusy, escalateEmail, escalateMessage, pathname]);

  if (enabled === null) return null;

  return (
    <div className="support-chat-root" aria-live="polite">
      {open ? (
        <section className="support-chat-panel" role="dialog" aria-label="Support chat">
          <header className="support-chat-head">
            <div>
              <p className="brand-kicker">OLYMPIC DESK</p>
              <h2>Support</h2>
            </div>
            <button type="button" className="icon-btn" aria-label="Close support chat" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </header>

          <p className="support-chat-privacy">
            Support chat is <strong>AI-monitored</strong> and logged on the server. Arena keys and event history stay
            local on your device.
          </p>

          <div className="support-chat-messages" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="support-chat-empty">
                {enabled ? (
                  <>
                    <p>Ask about plans, Stripe checkout, trials, or vault setup.</p>
                    <p className="hint">Subscribe first · add API keys after.</p>
                  </>
                ) : (
                  <>
                    <p>Live AI support is offline on this server.</p>
                    <Link href="/pricing" className="gold-btn support-chat-link-btn">
                      View plans
                    </Link>
                    <Link href="/about" className="ghost-btn support-chat-link-btn">
                      About &amp; FAQ
                    </Link>
                  </>
                )}
              </div>
            ) : null}
            {messages.map((message) => (
              <div key={message.id} className={cn("support-chat-bubble", message.role)}>
                {message.content}
              </div>
            ))}
            {busy ? <p className="support-chat-typing">Assistant is typing…</p> : null}
            {error ? <p className="flag-copy support-chat-error">{error}</p> : null}
          </div>

          {escalateOpen ? (
            <div className="support-chat-escalate">
              <p className="hint">Need a human? Leave a note and optional email.</p>
              <input
                type="email"
                placeholder="you@example.com (optional)"
                value={escalateEmail}
                onChange={(e) => setEscalateEmail(e.target.value)}
              />
              <textarea
                rows={2}
                placeholder="Describe your issue"
                value={escalateMessage}
                onChange={(e) => setEscalateMessage(e.target.value)}
              />
              <div className="support-chat-escalate-actions">
                <button type="button" className="ghost-btn" onClick={() => setEscalateOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="gold-btn"
                  disabled={escalateBusy || !escalateMessage.trim()}
                  onClick={() => void submitEscalation()}
                >
                  {escalateBusy ? "Sending…" : "Send to human"}
                </button>
              </div>
            </div>
          ) : null}

          {escalateNote ? <p className="hint gold support-chat-escalate-note">{escalateNote}</p> : null}

          <footer className="support-chat-foot">
            <button type="button" className="ghost-btn support-chat-human-btn" onClick={() => setEscalateOpen(true)}>
              <UserRound size={14} />
              Talk to a human
            </button>
            <div className="support-chat-input-row">
              <input
                type="text"
                value={input}
                placeholder={enabled ? "Ask about plans, Stripe, vault…" : "Support offline"}
                disabled={!enabled || busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button
                type="button"
                className="gold-btn"
                aria-label="Send support message"
                disabled={!enabled || busy || !input.trim()}
                onClick={() => void sendMessage()}
              >
                <Send size={16} />
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      <button
        type="button"
        className="support-chat-fab"
        aria-expanded={open}
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
