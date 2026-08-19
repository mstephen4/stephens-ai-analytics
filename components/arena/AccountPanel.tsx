"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Mail } from "lucide-react";
import { useArena } from "./ArenaProvider";

export function AccountPanel() {
  const { account, premiumStatus, requestSignIn, signOut, linkLicenseToAccount, licenseMessage } = useArena();
  const [email, setEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  if (account?.signedIn) {
    return (
      <div className="locker-body">
        <p className="hint gold">Signed in as {account.email}</p>
        <p>
          Tier: <strong>{premiumStatus.source === "trial" ? "Pro Trial" : premiumStatus.premium ? "Pro" : "Free"}</strong>
        </p>
        {premiumStatus.trialEndsAt ? (
          <p className="hint">
            Trial ends {new Date(premiumStatus.trialEndsAt).toLocaleDateString()}. BYOK vault unchanged — your API keys
            stay local.
          </p>
        ) : null}
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            void linkLicenseToAccount(licenseKey)
              .then(() => setMessage("License linked to your account."))
              .catch((err: unknown) => setMessage(err instanceof Error ? err.message : "Link failed."))
              .finally(() => setBusy(false));
          }}
        >
          <label>
            Link license key to this account
            <input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="XXXX-XXXX-XXXX" />
          </label>
          <button className="gold-btn" type="submit" disabled={busy || !licenseKey.trim()}>
            Link license
          </button>
        </form>
        <button className="ghost-btn" type="button" onClick={() => void signOut()}>
          <LogOut size={16} /> Sign out
        </button>
        {message ? <p className="hint">{message}</p> : null}
        {licenseMessage ? <p className="hint">{licenseMessage}</p> : null}
        <p className="about-note">
          <Link href="/about">About AI Olympiad →</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="locker-body">
      <p>
        Sign in with email to start a <strong>free Pro trial</strong> (Podium + Coach). Model access stays{" "}
        <strong>BYOK</strong> — add keys in the Vault separately.
      </p>
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
        Already purchased? Sign in with the <strong>same email</strong> used at Lemon Squeezy checkout, or link a key
        after sign-in.
      </p>
    </div>
  );
}
