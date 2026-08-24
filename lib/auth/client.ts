import type { AccountInfo } from "@/lib/premium";

export const ACCOUNT_CHANGED_EVENT = "olympiad:account";

const signedOutAccount: AccountInfo = {
  signedIn: false,
  email: null,
  premium: false,
  subscribed: false,
  source: null,
  tier: "free",
  trialEndsAt: null,
};

export function notifyAccountChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
}

export async function fetchAccount(): Promise<AccountInfo> {
  const response = await fetch("/api/me", { cache: "no-store" });
  const raw = await response.text();
  if (!raw) return signedOutAccount;
  try {
    return JSON.parse(raw) as AccountInfo;
  } catch {
    return signedOutAccount;
  }
}

export async function requestSignInLink(email: string): Promise<{ message?: string; devLink?: string }> {
  const response = await fetch("/api/auth/request-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const raw = await response.text();
  let json: {
    ok: boolean;
    error?: string;
    message?: string;
    devLink?: string;
  };
  try {
    json = raw ? (JSON.parse(raw) as typeof json) : { ok: false, error: "Empty server response." };
  } catch {
    throw new Error(
      response.ok
        ? "Invalid server response."
        : `Sign-in failed (${response.status}). Check AUTH_SECRET and RESEND on Vercel.`,
    );
  }
  if (!json.ok) throw new Error(json.error || "Could not send sign-in link.");
  return { message: json.message, devLink: json.devLink };
}

export async function signOutAccount(): Promise<void> {
  await fetch("/api/auth/signout", { method: "POST" });
  notifyAccountChanged();
}
