"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Mail } from "lucide-react";
import { PRO_SUBSCRIPTION_TAGLINE } from "@/lib/subscription";
import { PricingPlans } from "./PricingPlans";
import { useArena } from "./ArenaProvider";

export function AccountPanel() {
  const { account, premiumStatus, requestSignIn, signOut, openBillingPortal } = useArena();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  if (account?.signedIn) {
    const onTrial = premiumStatus.source === "trial";
    const { subscribed, premium, tier } = premiumStatus;
    const tierLabel = onTrial
      ? "Pro Trial"
      : premium
        ? tier === "lifetime"
          ? "Lifetime"
          : "Pro"
        : tier === "compare"
          ? "Compare"
          : tier === "single"
            ? "Single"
            : "Free";

    return (
      <div className="locker-body">
        <p className="hint gold">Signed in as {account.email}</p>
        <p>
          Tier: <strong>{tierLabel}</strong>
        </p>
        {premiumStatus.trialEndsAt ? (
          <p className="hint">
            Trial ends {new Date(premiumStatus.trialEndsAt).toLocaleDateString()}. BYOK vault unchanged — your API keys
            stay local.
          </p>
        ) : null}
        {!subscribed ? (
          <div className="subscription-offer">
            <p className="hint">{PRO_SUBSCRIPTION_TAGLINE}</p>
            <PricingPlans email={account.email} compact />
          </div>
        ) : null}
        {tier === "single" ? (
          <p className="hint">Single plan — upgrade to Compare for side-by-side + 2-lane Podium, or Pro for Coach.</p>
        ) : null}
        {tier === "compare" && !premium ? (
          <p className="hint">Compare plan active — upgrade to Pro for Coach and 6-lane Podium.</p>
        ) : null}
        {subscribed && premiumStatus.source === "stripe" ? (
          <button className="ghost-btn" type="button" onClick={() => void openBillingPortal()}>
            Manage subscription
          </button>
        ) : null}
        <button className="ghost-btn" type="button" onClick={() => void signOut()}>
          <LogOut size={16} /> Sign out
        </button>
        {message ? <p className="hint">{message}</p> : null}
        <p className="about-note">
          <Link href="/about">About AI Olympiad →</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="locker-body">
      <p>
        Sign in with email to start a <strong>free 3-day Pro trial</strong> (all modes + Coach). Model access stays{" "}
        <strong>BYOK</strong> — add keys in the Vault separately.
      </p>
      <PricingPlans compact />
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setDevLink(null);
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
          <Mail size={16} /> Email me a sign-in link
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
      <p className="about-note">
        Already purchased? Sign in with the <strong>same email</strong> used at Stripe checkout.
      </p>
    </div>
  );
}
