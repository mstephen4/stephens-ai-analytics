# Feature requirements — AI Olympiad vs ChatHub

This document lists ChatHub capabilities and what **AI Olympiad** adopts. Olympiad is **BYOK** (bring your own keys) and stores data **locally** — it does not resell model access like ChatHub.

## Adopted (major ChatHub-style features)

| Feature | ChatHub | AI Olympiad | Tier |
| --- | --- | --- | --- |
| **Multi-model compare** | 2 models free, up to 6 paid | **Compare mode**: 2 models side-by-side, one prompt | Compare / Pro / Trial |
| **Simultaneous streaming** | All lanes stream in parallel | Web Streams / SSE fan-out per lane | Compare / Pro |
| **Side-by-side grid** | Responsive grid of answers | Contender cards with live stats | Compare / Pro |
| **Many providers** | OpenAI, Anthropic, Google, Grok, Llama, DeepSeek, Mistral, … | **21 models** across 7 BYOK providers | With subscription + your keys |
| **Single-model chat** | Supported | **Single mode** | Single / Pro / Trial |
| **Podium + judge** | Implicit via comparison | Up to **6 lanes** + impartial judge ranks top 3 | Compare (2 lanes) / Pro (6 lanes) |
| **Smart routing** | Model picker | **Coach** (heuristic + optional classifier) | Pro / Lifetime / Trial |
| **Local history** | Cloud account | **IndexedDB** events on device | With subscription |
| **PWA / install** | Installable PWA (`manifest` + service worker) | Free to install; chat requires pass |
| **License gating** | Subscription | Stripe subscriptions | Single / Compare / Pro / Lifetime |

## Not adopted (out of scope for now)

| ChatHub feature | Reason |
| --- | --- |
| Hosted subscription to models | Olympiad is BYOK only |
| Image generation (FLUX, SD, …) | Not in brief; adds billing complexity |
| File / PDF upload & analysis | Future; needs client-side parsing pipeline |
| Web search / web access | Future; needs search API + egress policy |
| Prompt library | Future; local-only library possible later |
| Browser extension / native apps | PWA first; extension is a separate deliverable |
| Translation / summarizer tools | Can be done via prompts today |
| Code preview / execution | Not required for compare MVP |
| Cloud sync / accounts | Conflicts with zero-backend BYOK model |

## Provider keys (vault)

Users supply keys for any provider they use:

- OpenAI
- Anthropic
- Google (Gemini)
- DeepSeek
- Groq (Llama, Mixtral)
- xAI (Grok)
- Mistral

Keys stay in **Local Storage** (optional AES-GCM). They are sent only as request headers to the stateless Next.js proxy, which forwards to the provider.

## Data storage map

| Data | Where | Synced to GitHub? |
| --- | --- | --- |
| Source code | Git repo | Yes (when you commit/push) |
| API keys | Browser Local Storage | **Never** |
| Chat / events | Browser IndexedDB | **Never** |
| License activation | Browser Local Storage | **Never** |
| Stripe secrets + subscription rows | Server `.env.local` + SQLite | **Never** (gitignored) |

GitHub holds **code only**, not your runtime chat or keys. Local browser storage persists on **your machine** until you clear site data.
