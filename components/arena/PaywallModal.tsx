"use client";

import { Crown, X } from "lucide-react";
import {
  getLifetimeCheckoutUrl,
  getLifetimePriceLabel,
  getProCheckoutUrl,
  getProPriceLabel,
  PRO_SUBSCRIPTION_TAGLINE,
} from "@/lib/subscription";
import { useArena } from "./ArenaProvider";

export function PaywallModal() {
  const { paywall, setPaywall, setLockerOpen, setTrialModalOpen, account } = useArena();
  if (!paywall) return null;
  const title = paywall === "podium" ? "Unlock the Podium" : "Light the Coach’s torch";
  const proUrl = getProCheckoutUrl(account?.email);
  const lifetimeUrl = getLifetimeCheckoutUrl(account?.email);
  const proPrice = getProPriceLabel();
  const lifetimePrice = getLifetimePriceLabel();

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
        <p>{PRO_SUBSCRIPTION_TAGLINE}</p>
        <p>
          Free Player keeps single-model chat, 2-model compare, BYOK, and local history. Podium (up to 6 models +
          judge) and Coach routing require <strong>Olympiad Pro</strong> — subscription or lifetime pass for a{" "}
          <strong>single user</strong> (this browser vault).
        </p>
        <p className="hint">Pro unlocks features only. You still bring your own API keys and pay providers directly.</p>
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
          {proUrl ? (
            <a className="ghost-btn" href={proUrl} target="_blank" rel="noreferrer">
              {proPrice ? `Subscribe — ${proPrice}` : "Subscribe to Olympiad Pro"}
            </a>
          ) : null}
          {lifetimeUrl ? (
            <a className="ghost-btn" href={lifetimeUrl} target="_blank" rel="noreferrer">
              {lifetimePrice ? `Lifetime — ${lifetimePrice}` : "Lifetime pass"}
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
