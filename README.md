# AI Olympiad

A Bring-Your-Own-Key (BYOK) Progressive Web App to **compare multiple AI models side by side** (ChatHub-style), with optional **Coach** routing and **Podium** judging. See [FEATURES.md](./FEATURES.md) for what we adopt from ChatHub vs what is out of scope.

- **Homepage** [`/`] — landing with torch search bar (aligned to product mockup)
- **Events app** [`/events`] — single, compare (2 models, free), podium (up to 6 + judge, pro)

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

## Docs

- [FEATURES.md](./FEATURES.md) — ChatHub alignment & tier matrix
- `.env.example` — Lemon Squeezy IDs for Pro/Lifetime

```bash
npm test
npm run lint
npm run build
```
