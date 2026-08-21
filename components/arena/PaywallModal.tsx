"use client";

import { Crown, X } from "lucide-react";
import { PRO_SUBSCRIPTION_TAGLINE } from "@/lib/subscription";
import { PricingPlans } from "./PricingPlans";
import { useArena } from "./ArenaProvider";

export function PaywallModal() {
  const { paywall, setPaywall, setLockerOpen, setTrialModalOpen, account } = useArena();
  if (!paywall) return null;

  const title = paywall === "coach" ? "Light the Coach’s torch" : "Subscribe to use the arena";

  const detail =
    paywall === "coach"
      ? "Single, Compare, and Podium are included with Olympiad Single or a Pro trial. Coach routing is an Olympiad Pro feature."
      : "One UI, one vault for all your API keys — then Single, Compare, and Podium on this device. Start with a free Pro trial or choose Single or Pro below.";

  return (
    <div className="modal-root">
      <button className="modal-backdrop" aria-label="Close paywall" onClick={() => setPaywall(null)} />
      <div className="paywall-card paywall-card-wide" role="dialog" aria-modal="true">
        <button className="icon-btn close" onClick={() => setPaywall(null)} aria-label="Close">
          <X size={16} />
        </button>
        <Crown className="text-torch" />
        <p className="brand-kicker">OLYMPIC PASS</p>
        <h2>{title}</h2>
        <p>{PRO_SUBSCRIPTION_TAGLINE}</p>
        <p>{detail}</p>
        <p className="hint">Plans unlock features only. You still bring your own API keys and pay providers directly.</p>
        <PricingPlans email={account?.email} compact />
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
