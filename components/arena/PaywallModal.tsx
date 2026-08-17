"use client";

import { Crown, X } from "lucide-react";
import { useArena } from "./ArenaProvider";

const PRO_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO ?? "";
const LIFETIME_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_LIFETIME ?? "";

export function PaywallModal() {
  const { paywall, setPaywall, setLockerOpen } = useArena();
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
        <h2>{title} with a Pro or Lifetime Pass.</h2>
        <p>
          Free Player keeps single-model chat, 2-model compare, BYOK, and local history. The Podium (up to 6 models +
          judge) and Coach routing are reserved for paid passes.
        </p>
        <div className="paywall-actions">
          {PRO_URL ? (
            <a className="gold-btn" href={PRO_URL} target="_blank" rel="noreferrer">
              Olympiad Pro
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
              setLockerOpen(true, "pass");
            }}
          >
            I have a license key
          </button>
        </div>
      </div>
    </div>
  );
}
