# The Arena

A Bring-Your-Own-Key (BYOK) Progressive Web App that treats multi-model generation like a decathlon. Users act as General Manager, deploy provider models as athletes, and optionally unlock **The Coach** (cost-aware routing) and **The Podium** (three-lane concurrent generation with an impartial judge).

There is no user database and no subscription backend of our own. API keys never leave the browser except as request headers to a zero-retention Next.js proxy that talks to OpenAI, Anthropic, and Google. Premium is a Lemon Squeezy license key cached in Local Storage.

## Stack

- Next.js App Router, React, Tailwind CSS
- Installable PWA via `app/manifest.ts` + `public/sw.js`
- Client storage: Local Storage (keys, license) and IndexedDB (meet history)
- Unified provider router (LiteLLM-style model IDs, Web Streams / SSE)
- Two-tier Coach: local heuristic classifier, optional Flash / Haiku / Mini pass
- Lemon Squeezy License API (`/v1/licenses/activate` and `/validate`)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add provider keys in **Locker Room → Vault**. Free Player can chat with a single athlete immediately.

```bash
npm test
npm run lint
npm run build
```

## Environment

Set these on the host (Vercel, etc.). They are **not** required for Free Player.

| Variable | Purpose |
| --- | --- |
| `LEMONSQUEEZY_STORE_ID` | Store that issued the key (`meta.store_id`) |
| `LEMONSQUEEZY_PRODUCT_ID` | Arena product (`meta.product_id`) |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Monthly/annual subscription variant |
| `LEMONSQUEEZY_LIFETIME_VARIANT_ID` | One-time Lifetime variant |
| `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO` | Checkout URL on the paywall |
| `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_LIFETIME` | Lifetime checkout URL |

Activation posts the pasted key to `/api/license/activate`, which calls Lemon Squeezy and **rejects keys whose store/product/variant IDs do not match**. The client stores the activation record (including `instance_id`) in Local Storage and re-validates on boot and every 30 minutes. An expired subscription drops the UI back to Free Player; chat history is not deleted.

## Security model

- Provider keys: Local Storage, optional AES-GCM with a master password (PBKDF2 150k).
- Encrypted vaults stay locked in memory until the password is entered.
- `/api/chat`, `/api/coach`, and `/api/judge` are stateless. They read `x-arena-*-key` headers, stream from the provider, and log nothing.
- License keys are validated against Lemon Squeezy; product IDs are enforced server-side so a random third-party Lemon key cannot unlock The Arena.

## Product tiers

1. **Free Player** — single-model chat, BYOK, local history
2. **Arena Pro** — Coach + Podium while the subscription license stays `active`
3. **Arena Lifetime** — same premium features, no expiry (unless the key is disabled)

## PWA

Chrome / Edge / Safari can **Add to Home Screen** from the installable manifest (`theme_color` `#1A1D21`). The service worker precaches the shell and an offline torch page at `/offline`.
