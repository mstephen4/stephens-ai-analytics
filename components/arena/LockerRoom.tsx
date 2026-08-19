"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { AboutContent } from "@/components/about/AboutContent";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";
import { AccountPanel } from "./AccountPanel";
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
                  ? "Pro Pass"
                  : item === "account"
                    ? "Account"
                    : "About"}
            </button>
          ))}
        </div>
        {lockerTab === "vault" ? <VaultPanel /> : null}
        {lockerTab === "pass" ? <PassForm /> : null}
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

function PassForm() {
  const { license, premium, activate, clearLicense, licenseMessage } = useArena();
  const [key, setKey] = useState(license?.licenseKey ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="locker-body">
      <p>
        Paste the alphanumeric license key emailed after Lemon Squeezy checkout. Works on this device without signing
        in — or link it to your account after sign-in.
      </p>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          void activate(key)
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Activation failed."))
            .finally(() => setBusy(false));
        }}
      >
        <label>
          License key
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="XXXX-XXXX-XXXX" />
        </label>
        <button className="gold-btn" type="submit" disabled={busy || !key.trim()}>
          {busy ? "Checking tape…" : "Activate pass"}
        </button>
      </form>
      {premium ? (
        <p className="hint gold">
          Pass active · {license?.tier} · product {license?.productId} / variant {license?.variantId}
        </p>
      ) : (
        <p className="hint">Free Player — single-model and 2-model compare stay available.</p>
      )}
      {error ? <p className="flag-copy">{error}</p> : null}
      {licenseMessage ? <p className="hint">{licenseMessage}</p> : null}
      {license ? (
        <button className="ghost-btn" onClick={clearLicense}>
          Remove pass from this device
        </button>
      ) : null}
      <p className="about-note">
        <Link href="/about">Full About page →</Link>
      </p>
    </div>
  );
}
