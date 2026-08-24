"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { LogOut, Mail, X } from "lucide-react";
import { ACCOUNT_CHANGED_EVENT, fetchAccount, requestSignInLink, signOutAccount } from "@/lib/auth/client";
import { displayPremiumTier, type AccountInfo } from "@/lib/premium";
import { cn } from "@/lib/utils";

interface LoginContextValue {
  account: AccountInfo | null;
  openLogin: () => void;
  closeLogin: () => void;
}

const LoginContext = createContext<LoginContextValue | null>(null);

export function useLoginPopup() {
  const value = useContext(LoginContext);
  if (!value) throw new Error("useLoginPopup must be used within LoginProvider");
  return value;
}

export function LoginProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  const refresh = useCallback(async () => {
    try {
      setAccount(await fetchAccount());
    } catch {
      // keep last known account
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => {
      void refresh();
    };
    window.addEventListener(ACCOUNT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, onChange);
  }, [refresh]);

  const openLogin = useCallback(() => setOpen(true), []);
  const closeLogin = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ account, openLogin, closeLogin }),
    [account, openLogin, closeLogin],
  );

  return (
    <LoginContext.Provider value={value}>
      {children}
      {open ? <LoginModal account={account} onClose={closeLogin} onRefresh={refresh} /> : null}
    </LoginContext.Provider>
  );
}

export function LoginButton({
  variant = "nav",
  className,
}: {
  variant?: "nav" | "banner" | "header";
  className?: string;
}) {
  const { account, openLogin } = useLoginPopup();
  const signedIn = Boolean(account?.signedIn);
  const label = signedIn ? "Account" : "Login";

  return (
    <button
      type="button"
      className={cn(
        variant === "banner" ? "gold-btn login-btn login-btn-banner" : "ghost-btn login-btn",
        variant === "header" && "login-btn-header",
        className,
      )}
      onClick={openLogin}
      aria-haspopup="dialog"
      aria-label={signedIn ? "Open account" : "Open login"}
    >
      {label}
    </button>
  );
}

function LoginModal({
  account,
  onClose,
  onRefresh,
}: {
  account: AccountInfo | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [email, setEmail] = useState(account?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const signedIn = Boolean(account?.signedIn);

  return (
    <div className="modal-root login-modal-root">
      <button className="modal-backdrop" aria-label="Close login" onClick={onClose} />
      <div className="paywall-card login-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="icon-btn close" type="button" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <p className="brand-kicker">{signedIn ? "ACCOUNT" : "LOGIN"}</p>
        <h2 id="login-title">{signedIn ? "You're signed in" : "Sign in with email"}</h2>
        {signedIn ? (
          <>
            <p className="hint gold">Signed in as {account?.email}</p>
            <p>
              Plan: <strong>{displayPremiumTier({
                premium: Boolean(account?.premium),
                subscribed: Boolean(account?.subscribed),
                source: account?.source ?? null,
                tier: account?.tier ?? "free",
                trialEndsAt: account?.trialEndsAt ?? null,
                email: account?.email ?? null,
              })}</strong>
            </p>
            <p className="hint">Use the same email you used at Stripe checkout to unlock a paid plan.</p>
            <div className="login-card-actions">
              <Link href="/events" className="gold-btn" onClick={onClose}>
                Open Events
              </Link>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setBusy(true);
                  void signOutAccount()
                    .then(() => onRefresh())
                    .finally(() => setBusy(false));
                }}
                disabled={busy}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              Enter the email you used at checkout. We&apos;ll send a sign-in link — no password needed.
            </p>
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                setBusy(true);
                setDevLink(null);
                void requestSignInLink(email)
                  .then((result) => {
                    setMessage(result.message ?? "Check your email for a sign-in link.");
                    setDevLink(result.devLink ?? null);
                  })
                  .catch((error: unknown) =>
                    setMessage(error instanceof Error ? error.message : "Could not send sign-in link."),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </label>
              <button className="gold-btn" type="submit" disabled={busy || !email.trim()}>
                <Mail size={16} /> {busy ? "Sending…" : "Email me a sign-in link"}
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
            <p className="hint">
              New here? You can also start a <Link href="/events?trial=1">free 3-day Pro trial</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
