# AI Olympiad

A Bring-Your-Own-Key (BYOK) Progressive Web App to **compare multiple AI models side by side** (ChatHub-style), with optional **Coach** routing and **Podium** judging. See [FEATURES.md](./FEATURES.md) for what we adopt from ChatHub vs what is out of scope.

- **Homepage** [`/`] — landing with torch search bar (aligned to product mockup)
- **Events app** [`/events`] — Single, Compare, and Podium (subscription or trial); Coach on Pro

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add provider keys under **Vault** on `/events`.

Windows: run `setup.bat` from Command Prompt after checking out this branch.

## Models (21 across 7 providers)

OpenAI · Anthropic · Google · DeepSeek · Groq (Llama/Mixtral) · xAI (Grok) · Mistral

## Data storage

| What | Where |
| --- | --- |
| Source code | GitHub (when you push) |
| API keys, license, settings | Browser Local Storage only |
| Chat history | Browser IndexedDB only |

GitHub never receives your keys or conversations. Clearing site data in the browser removes local history.

## Plans (single user, BYOK)

| Plan | Price | Unlocks |
| --- | --- | --- |
| **Trial** | 3 days | Full Pro via email sign-in |
| **Single** | $5/mo · $49/yr | Single, Compare, Podium (3 lanes) + vault UI |
| **Pro** | $9/mo · $99/yr | + Coach + 6-lane Podium |

Configure Lemon Squeezy checkout URLs in `.env` (see `.env.example`). Prices are displayed from `lib/subscription.ts` and must match your store.

## Pro subscription (single user)

Olympiad Pro is a **personal** subscription (one email, one browser vault) via [Lemon Squeezy](https://www.lemonsqueezy.com). **Single** unlocks all three chat modes; **Pro** adds Coach and 6-lane Podium — model usage stays **BYOK**.

**Price is not hard-coded in this repo.** Set it in your Lemon Squeezy product, then configure:

```env
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_PRO=https://…
NEXT_PUBLIC_PRO_PRICE_LABEL=$X/mo   # display only — match your store
NEXT_PUBLIC_LEMONSQUEEZY_CUSTOMER_PORTAL=https://…  # optional
```

After checkout, the webhook links the license to the buyer’s email; sign in with that email on **Account** to activate Pro.

## Docs

- [FEATURES.md](./FEATURES.md) — ChatHub alignment & tier matrix
- `.env.example` — Lemon Squeezy IDs for Pro/Lifetime

```bash
npm test
npm run lint
npm run build
```
