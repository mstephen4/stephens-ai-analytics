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
| API keys, settings | Browser Local Storage only |
| Chat history | Browser IndexedDB only |
| Stripe subscription link | Server SQLite (`license_by_email`) |

GitHub never receives your keys or conversations. Clearing site data in the browser removes local history.

## Plans (single user, BYOK)

| Plan | Price | Unlocks |
| --- | --- | --- |
| **Trial** | 3 days | Full Pro via email sign-in |
| **Single** | $5/mo · $49/yr | Single-mode chat + vault UI |
| **Compare** | $7/mo · $75/yr | Compare + Podium (2 lanes + Judge) |
| **Pro** | $9/mo · $99/yr | All modes + Coach + 6-lane Podium |

Configure Stripe price IDs in `.env` (see `.env.example`). Prices displayed in the app come from `lib/subscription.ts` and should match your Stripe products.

## Stripe subscription (single user)

Olympiad is a **personal** subscription (one email, one browser vault) via [Stripe](https://stripe.com). **Single** unlocks chat; **Compare** adds 2-lane Podium; **Pro** adds Coach and 6 lanes — model usage stays **BYOK**.

Set in `.env.local` (and your host):

```env
STRIPE_SECRET_KEY=sk_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_PRICE_SINGLE_MONTHLY=price_…
STRIPE_PRICE_SINGLE_YEARLY=price_…
STRIPE_PRICE_COMPARE_MONTHLY=price_…
STRIPE_PRICE_COMPARE_YEARLY=price_…
STRIPE_PRICE_PRO_MONTHLY=price_…
STRIPE_PRICE_PRO_YEARLY=price_…
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Stripe webhook URL: `https://yourdomain.com/api/webhooks/stripe`

After checkout, sign in on **Account** with the **same email** used at Stripe to activate the plan.

## Docs

- [FEATURES.md](./FEATURES.md) — ChatHub alignment & tier matrix
- `.env.example` — Stripe + auth env vars

```bash
npm test
npm run lint
npm run build
```
