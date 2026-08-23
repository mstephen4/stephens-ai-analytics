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
      ? "Coach routing is an Olympiad Pro feature. Single unlocks one-on-one chat; Compare adds 2-lane Podium; Pro adds Coach and 6-lane Podium."
      : "Subscribe via Stripe first — no API keys required at checkout. After payment, sign in on Account with the same email, then add keys in the Vault when you're ready to chat.";

  return (
    <div className="modal-root">
      <button className="modal-backdrop" aria-label="Close paywall" onClick={() => {
        setPaywall(null);
        sessionStorage.setItem("olympiad.plansDismissed", "1");
      }} />
      <div className="paywall-card paywall-card-wide" role="dialog" aria-modal="true">
        <button className="icon-btn close" onClick={() => {
          setPaywall(null);
          sessionStorage.setItem("olympiad.plansDismissed", "1");
        }} aria-label="Close">
          <X size={16} />
        </button>
        <Crown className="text-torch" />
        <p className="brand-kicker">OLYMPIC PASS</p>
        <h2>{title}</h2>
        <p>{PRO_SUBSCRIPTION_TAGLINE}</p>
        <p>{detail}</p>
        <p className="hint">Plans unlock features only. API keys are added in the Vault after you subscribe — you pay providers directly.</p>
        <PricingPlans email={account?.email} compact />
        <div className="paywall-actions">
          <button
            className="ghost-btn"
            onClick={() => {
              setPaywall(null);
              setTrialModalOpen(true);
            }}
          >
            Or start free Pro trial
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
