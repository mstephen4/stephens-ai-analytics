"use client";

import { useState } from "react";
import { ExternalLink, Lock, Unlock } from "lucide-react";
import { STARTER_PROVIDERS, type StarterProviderId } from "@/lib/provider-guides";
import { emptyKeys, providerLabel } from "@/lib/models";
import type { ProviderId, ProviderKeys } from "@/lib/types";
import { keyHeaders } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

type VaultView = "wizard" | "advanced";

export function VaultPanel() {
  const { keys, vaultEncrypted, vaultUnlocked, saveKeys, unlock, lock } = useArena();
  const [view, setView] = useState<VaultView>(() => (hasAnyStoredKey(keys) ? "advanced" : "wizard"));

  return (
    <div className="locker-body">
      <div className="vault-view-toggle">
        <button type="button" className={cn(view === "wizard" && "active")} onClick={() => setView("wizard")}>
          Quick start
        </button>
        <button type="button" className={cn(view === "advanced" && "active")} onClick={() => setView("advanced")}>
          All providers
        </button>
      </div>

      {view === "wizard" ? (
        <VaultWizard onAdvanced={() => setView("advanced")} />
      ) : (
        <VaultAdvancedForm
          keys={keys}
          vaultEncrypted={vaultEncrypted}
          vaultUnlocked={vaultUnlocked}
          saveKeys={saveKeys}
          unlock={unlock}
          lock={lock}
        />
      )}
    </div>
  );
}

function hasAnyStoredKey(keys: ProviderKeys): boolean {
  return Object.values(keys).some((value) => Boolean(value.trim()));
}

function VaultWizard({ onAdvanced }: { onAdvanced: () => void }) {
  const { keys, saveKeys } = useArena();
  const [provider, setProvider] = useState<StarterProviderId>("google");
  const [keyValue, setKeyValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testOk, setTestOk] = useState<boolean | null>(null);

  const guide = STARTER_PROVIDERS.find((item) => item.id === provider) ?? STARTER_PROVIDERS[0];

  const testKey = async () => {
    if (!keyValue.trim()) {
      setMessage("Paste a key first.");
      setTestOk(false);
      return;
    }
    setTesting(true);
    setMessage(null);
    setTestOk(null);
    try {
      const draft = { ...keys, [provider]: keyValue.trim() };
      const response = await fetch("/api/vault/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...keyHeaders(draft),
        },
        body: JSON.stringify({ provider }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string; preview?: string };
      if (json.ok) {
        setTestOk(true);
        setMessage(`Key works — ${json.preview ?? "vault ok"}`);
      } else {
        setTestOk(false);
        setMessage(json.error ?? "Key test failed.");
      }
    } catch {
      setTestOk(false);
      setMessage("Network error while testing key.");
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    if (!keyValue.trim()) {
      setMessage("Paste a key before saving.");
      return;
    }
    const draft = { ...keys, [provider]: keyValue.trim() };
    await saveKeys(draft);
    setMessage("Vault saved. Head to Events and light the torch.");
    setTestOk(true);
  };

  return (
    <>
      <p className="vault-intro">
        You only need <strong>one</strong> provider to start. Keys stay in this browser and are never written to a
        database.
      </p>

      <p className="vault-label">Pick your first provider</p>
      <div className="starter-provider-grid">
        {STARTER_PROVIDERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn("starter-provider-card", provider === item.id && "active")}
            onClick={() => {
              setProvider(item.id);
              setKeyValue(keys[item.id] ?? "");
              setMessage(null);
              setTestOk(null);
            }}
          >
            <strong>{item.label}</strong>
            <span>{item.tagline}</span>
          </button>
        ))}
      </div>

      <ol className="vault-steps">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="vault-links">
        <a href={guide.keyUrl} target="_blank" rel="noopener noreferrer" className="ghost-btn">
          <ExternalLink size={14} /> Get API key
        </a>
        <a href={guide.docsUrl} target="_blank" rel="noopener noreferrer" className="ghost-btn">
          <ExternalLink size={14} /> Docs
        </a>
      </div>

      <label>
        {guide.label} API key
        <input
          type="password"
          value={keyValue}
          placeholder="Paste key here"
          autoComplete="off"
          onChange={(e) => {
            setKeyValue(e.target.value);
            setTestOk(null);
          }}
        />
      </label>

      <p className="hint">{guide.costNote}</p>

      <div className="row">
        <button type="button" className="ghost-btn" onClick={() => void testKey()} disabled={testing}>
          {testing ? "Testing…" : "Test key"}
        </button>
        <button type="button" className="gold-btn" onClick={() => void save()}>
          Save vault
        </button>
      </div>

      {message ? <p className={cn("hint", testOk && "gold")}>{message}</p> : null}

      <button type="button" className="vault-advanced-link" onClick={onAdvanced}>
        Advanced: manage all seven providers →
      </button>
    </>
  );
}

function VaultAdvancedForm({
  keys,
  vaultEncrypted,
  vaultUnlocked,
  saveKeys,
  unlock,
  lock,
}: {
  keys: ProviderKeys;
  vaultEncrypted: boolean;
  vaultUnlocked: boolean;
  saveKeys: (keys: ProviderKeys, password?: string) => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
}) {
  const [draft, setDraft] = useState<ProviderKeys>(keys);
  const [password, setPassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const setKey = (provider: ProviderId, value: string) => {
    setDraft((current) => ({ ...current, [provider]: value }));
  };

  return (
    <>
      <p>
        Master keys stay in this browser. They are sent only as request headers to a zero-retention edge proxy that talks
        to the provider — never written to a database.
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
                  placeholder="sk-…"
                  autoComplete="off"
                  onChange={(e) => setKey(provider, e.target.value)}
                />
              </label>
            ),
          )}
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
    </>
  );
}
