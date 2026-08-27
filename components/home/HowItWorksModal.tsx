"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "olympiad.howItWorksDismissed";

export function useHowItWorksModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setOpen(true);
  }, []);

  const openModal = () => setOpen(true);
  const closeModal = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  return { open, openModal, closeModal };
}

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="modal-root how-it-works-modal-root">
      <button className="modal-backdrop" aria-label="Close How It Works" onClick={onClose} />
      <div className="paywall-card how-it-works-card" role="dialog" aria-modal="true" aria-labelledby="how-title">
        <button className="icon-btn close" type="button" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <p className="brand-kicker">HOW IT WORKS</p>
        <h2 id="how-title">How AI Olympiad works</h2>
        <p className="how-it-works-lede">
          Subscribe first — no API keys at checkout. Sign in, add keys in the Vault when you&apos;re ready, then run
          events in Single, Compare, or Podium mode.
        </p>

        <ol className="how-it-works-steps">
          <li>
            <strong>Pick a plan</strong>
            <span>
              Choose Single, Compare, or Pro on the{" "}
              <Link href="/pricing" onClick={onClose}>
                Plans page
              </Link>
              . Stripe checkout does not require API keys.
            </span>
          </li>
          <li>
            <strong>Sign in with email</strong>
            <span>
              Use the same email you used at checkout. We send a magic link — no password. Your plan unlocks on{" "}
              <Link href="/events" onClick={onClose}>
                Events
              </Link>
              .
            </span>
          </li>
          <li>
            <strong>Add keys in the Vault</strong>
            <span>
              Open the Locker Room → Vault. Paste provider API keys locally on your device. You pay OpenAI, Google,
              Anthropic, and others directly — Olympiad does not resell model credits.
            </span>
          </li>
          <li>
            <strong>Run an event</strong>
            <span>
              <strong>Single</strong> — one athlete, one thread. <strong>Compare</strong> — two models side-by-side.
              <strong> Podium</strong> — up to six lanes; an impartial Judge ranks gold, silver, and bronze.
            </span>
          </li>
          <li>
            <strong>Pro extras</strong>
            <span>
              <strong>Coach</strong> recommends a cost-efficient model while you type. Live metrics show time, tok/s, and
              estimated cost per lane.
            </span>
          </li>
        </ol>

        <div className="how-it-works-actions">
          <Link href="/pricing" className="gold-btn" onClick={onClose}>
            View plans
          </Link>
          <Link href="/events" className="ghost-btn" onClick={onClose}>
            Enter Events
          </Link>
        </div>
      </div>
    </div>
  );
}
