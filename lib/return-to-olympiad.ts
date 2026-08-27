export const VAULT_WINDOW_NAME = "ai-olympiad-vault";

/** Tag this tab so subscribers can return after visiting a provider console. */
export function tagVaultWindow(): void {
  if (typeof window === "undefined") return;
  window.name = VAULT_WINDOW_NAME;
}

export function openProviderPortal(url: string): void {
  tagVaultWindow();
  window.open(url, "_blank");
}

/** Drag to bookmarks bar, or run from the provider tab after getting a key. */
export const RETURN_TO_OLYMPIAD_BOOKMARKLET = `javascript:(function(){var t=window.open('','${VAULT_WINDOW_NAME}');if(t&&!t.closed){t.focus();}else{alert('Switch back to your AI Olympiad tab — the Vault is waiting for your key.');}})();`;
