"use client";

import { Crown, X } from "lucide-react";
import { useArena } from "./ArenaProvider";

const PRO_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO ?? "";
const LIFETIME_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_LIFETIME ?? "";

export function PaywallModal() {
  const { paywall, setPaywall, setLockerOpen, setTrialModalOpen } = useArena();
  if (!paywall) return null;
  const title = paywall === "podium" ? "Unlock the Podium" : "Light the Coach’s torch";

  return (
    <div className="modal-root">
      <button className="modal-backdrop" aria-label="Close paywall" onClick={() => setPaywall(null)} />
      <div className="paywall-card" role="dialog" aria-modal="true">
        <button className="icon-btn close" onClick={() => setPaywall(null)} aria-label="Close">
          <X size={16} />
        </button>
        <Crown className="text-torch" />
        <p className="brand-kicker">OLYMPIC PASS</p>
        <h2>{title}</h2>
        <p>
          Free Player keeps single-model chat, 2-model compare, BYOK, and local history. Podium (up to 6 models +
          judge) and Coach routing require Pro — via <strong>free trial</strong>, subscription, or lifetime pass.
        </p>
        <p className="hint">Pro unlocks features only. You still bring your own API keys for model access.</p>
        <div className="paywall-actions">
          <button
            className="gold-btn"
            onClick={() => {
              setPaywall(null);
              setTrialModalOpen(true);
            }}
          >
            Start free Pro trial
          </button>
          {PRO_URL ? (
            <a className="ghost-btn" href={PRO_URL} target="_blank" rel="noreferrer">
              Buy Olympiad Pro
            </a>
          ) : null}
          {LIFETIME_URL ? (
            <a className="ghost-btn" href={LIFETIME_URL} target="_blank" rel="noreferrer">
              Lifetime
            </a>
          ) : null}
          <button
            className="ghost-btn"
            onClick={() => {
              setPaywall(null);
              setLockerOpen(true, "account");
            }}
          >
            Sign in / link license
          </button>
        </div>
      </div>
    </div>
  );
}
