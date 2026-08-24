/** Canonical app origin for redirects, Stripe checkout URLs, and auth links (server-only). */
export function appBaseUrl(env: Record<string, string | undefined> = process.env): string {
  return (
    env.APP_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

export function appOriginFromRequest(request: Request): string {
  const configured = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured;
  return request.headers.get("origin")?.trim() || "http://localhost:3000";
}
