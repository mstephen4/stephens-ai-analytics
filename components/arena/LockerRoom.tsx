"use client";

import { useState } from "react";
import { Lock, Unlock, X } from "lucide-react";
import { emptyKeys, providerLabel } from "@/lib/models";
import type { ProviderId, ProviderKeys } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

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
            <h2>Vault & Pass</h2>
          </div>
          <button className="icon-btn" onClick={() => setLockerOpen(false)} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="locker-tabs">
          {(["vault", "pass", "about"] as const).map((item) => (
            <button
              key={item}
              className={cn(lockerTab === item && "active")}
              onClick={() => setLockerOpen(true, item)}
            >
              {item === "vault" ? "Vault" : item === "pass" ? "Pro Pass" : "About"}
            </button>
          ))}
        </div>
        {lockerTab === "vault" ? <VaultForm /> : null}
        {lockerTab === "pass" ? <PassForm /> : null}
        {lockerTab === "about" ? <AboutCopy /> : null}
      </aside>
    </div>
  );
}

function VaultForm() {
  const { keys, vaultEncrypted, vaultUnlocked, saveKeys, unlock, lock } = useArena();
  const [draft, setDraft] = useState<ProviderKeys>(keys);
  const [password, setPassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const setKey = (provider: ProviderId, value: string) => {
    setDraft((current) => ({ ...current, [provider]: value }));
  };

  return (
    <div className="locker-body">
      <p>
        Master keys stay in this browser. They are sent only as request headers to a zero-retention edge proxy that
        talks to the provider — never written to a database.
      </p>
      {vaultEncrypted && !vaultUnlocked ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            void unlock(unlockPassword)
              .then(() => setMessage("Vault unlocked."))
              .catch(() => setMessage("Wrong master password."));
          }}
        >
          <label>
            Master password
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className="gold-btn" type="submit">
            <Unlock size={16} /> Unlock vault
          </button>
        </form>
      ) : (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            void saveKeys(draft, password || undefined).then(() =>
              setMessage(password ? "Keys encrypted at rest." : "Keys saved locally."),
            );
          }}
        >
          {(["openai", "anthropic", "google", "deepseek", "groq", "xai", "mistral"] as ProviderId[]).map(
            (provider) => (
            <label key={provider}>
              {providerLabel(provider)} API key
              <input
                type="password"
                value={draft[provider]}
                placeholder={`sk-…`}
                autoComplete="off"
                onChange={(e) => setKey(provider, e.target.value)}
              />
            </label>
          ))}
          <label>
            Optional master password (AES-GCM)
            <input
              type="password"
              value={password}
              placeholder="Encrypt keys at rest"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="row">
            <button className="gold-btn" type="submit">
              Save vault
            </button>
            {vaultEncrypted ? (
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  lock();
                  setDraft(emptyKeys());
                }}
              >
                <Lock size={16} /> Lock
              </button>
            ) : null}
          </div>
        </form>
      )}
      {message ? <p className="hint gold">{message}</p> : null}
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
        Paste the alphanumeric license key emailed after Lemon Squeezy checkout. No username or password account is
        required.
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
    </div>
  );
}

function AboutCopy() {
  return (
    <div className="locker-body">
      <p>
        AI Olympiad is a BYOK PWA. Chat history lives in IndexedDB on this device. If a Pro subscription expires, the
        app degrades to Free Player without deleting your event history.
      </p>
      <p>
        Install it from the browser “Add to Home Screen” prompt for a stadium-style standalone app.
      </p>
    </div>
  );
}
