"use client";

import { useState } from "react";
import { Crown, X } from "lucide-react";
import { useArena } from "./ArenaProvider";

export function TrialModal() {
  const { trialModalOpen, setTrialModalOpen, requestSignIn, account, premium } = useArena();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  if (!trialModalOpen || premium || account?.signedIn) return null;

  return (
    <div className="modal-root">
      <button
        className="modal-backdrop"
        aria-label="Close trial offer"
        onClick={() => {
          setTrialModalOpen(false);
          sessionStorage.setItem("olympiad.trialDismissed", "1");
        }}
      />
      <div className="paywall-card trial-card" role="dialog" aria-modal="true">
        <button
          className="icon-btn close"
          onClick={() => {
            setTrialModalOpen(false);
            sessionStorage.setItem("olympiad.trialDismissed", "1");
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <Crown className="text-torch" />
        <p className="brand-kicker">FREE PRO TRIAL</p>
        <h2>Try Podium &amp; Coach free</h2>
        <p>
          Sign in with email for a Pro trial — ranked Podium judging and Coach routing. Prefer to pay now?{" "}
          <a href="/pricing">View plans</a> — no API keys required at checkout.
        </p>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            void requestSignIn(email)
              .then((result) => {
                setMessage(result.message ?? "Check your email.");
                setDevLink(result.devLink ?? null);
              })
              .catch((err: unknown) => setMessage(err instanceof Error ? err.message : "Request failed."))
              .finally(() => setBusy(false));
          }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <button className="gold-btn" type="submit" disabled={busy || !email.trim()}>
            {busy ? "Sending…" : "Start free trial"}
          </button>
        </form>
        {message ? <p className="hint gold">{message}</p> : null}
        {devLink ? (
          <p className="hint">
            Dev link:{" "}
            <a href={devLink} className="dev-link">
              Sign in
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
