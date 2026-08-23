"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { AboutContent } from "@/components/about/AboutContent";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";
import { AccountPanel } from "./AccountPanel";
import { PricingPlans } from "./PricingPlans";
import { VaultPanel } from "./VaultPanel";

export function LockerRoom() {
  const { lockerOpen, lockerTab, setLockerOpen } = useArena();
  if (!lockerOpen) return null;

  return (
    <div className="drawer-root">
      <button className="modal-backdrop" aria-label="Close locker room" onClick={() => setLockerOpen(false)} />
      <aside className="locker">
        <header className="locker-head">
          <div>
            <p className="brand-kicker">LOCKER ROOM</p>
            <h2>Vault &amp; Pass</h2>
          </div>
          <button className="icon-btn" onClick={() => setLockerOpen(false)} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="locker-tabs">
          {(["vault", "pass", "account", "about"] as const).map((item) => (
            <button
              key={item}
              className={cn(lockerTab === item && "active")}
              onClick={() => setLockerOpen(true, item)}
            >
              {item === "vault"
                ? "Vault"
                : item === "pass"
                  ? "Plan"
                  : item === "account"
                    ? "Account"
                    : "About"}
            </button>
          ))}
        </div>
        {lockerTab === "vault" ? <VaultPanel /> : null}
        {lockerTab === "pass" ? <SubscriptionPanel /> : null}
        {lockerTab === "account" ? <AccountPanel /> : null}
        {lockerTab === "about" ? (
          <div className="locker-body locker-about">
            <AboutContent compact />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function SubscriptionPanel() {
  const { account, premiumStatus, openBillingPortal } = useArena();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="locker-body">
      <p>
        Subscribe via <strong>Stripe</strong> — no API keys required at checkout. After payment, sign in on{" "}
        <strong>Account</strong> with the same email to unlock your plan on this device.
      </p>
      <PricingPlans email={account?.email} compact />
      {premiumStatus.subscribed && premiumStatus.source === "stripe" ? (
        <button
          className="ghost-btn"
          type="button"
          onClick={() => {
            setError(null);
            void openBillingPortal().catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Could not open billing portal.");
            });
          }}
        >
          Manage subscription
        </button>
      ) : (
        <p className="hint">No active Stripe subscription linked to this account yet.</p>
      )}
      {error ? <p className="flag-copy">{error}</p> : null}
      <p className="about-note">
        <Link href="/about">Full About page →</Link>
      </p>
    </div>
  );
}
