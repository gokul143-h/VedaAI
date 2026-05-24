# VedaAI — AI Assessment Creator

Next.js app for creating assignments, generating question papers with AI, and managing class workflows.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Environment (`.env.local`)

```env
AI_PROVIDER=meta
LLAMA_API_KEY=your-key
OPENAI_MODEL=Llama-3.3-70B-Instruct
USE_MOCK_AI=false
```

Get a free Llama API key at [llama.developer.meta.com](https://llama.developer.meta.com/).

Alternatives: set `AI_PROVIDER=groq` + `GROQ_API_KEY`, or `AI_PROVIDER=openwebui` + `OPENWEBUI_API_KEY`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production server locally |

## Deploy

See **[docs/FULL-STACK-DEPLOY.md](docs/FULL-STACK-DEPLOY.md)** for connecting frontend (Vercel) + backend (Render) as one network.

### Option 1: Vercel (frontend)

1. Push this repo to GitHub: [https://github.com/gokul143-h/VedaAI](https://github.com/gokul143-h/VedaAI)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variables in Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `AI_PROVIDER` | `meta` |
| `LLAMA_API_KEY` | API key from [llama.developer.meta.com](https://llama.developer.meta.com/) |
| `OPENAI_MODEL` | `Llama-3.3-70B-Instruct` |
| `OPENAI_VISION_MODEL` | `Llama-4-Scout-17B-16E-Instruct-FP8` |
| `USE_MOCK_AI` | `false` |

Do **not** set `NEXT_PUBLIC_API_URL` to `localhost` on Vercel — leave it unset so the app uses built-in `/api/ai/generate`. After adding env vars, redeploy the project.

4. Deploy — Vercel auto-detects Next.js

Or from CLI (after `npm i -g vercel` and `vercel login`):

```bash
vercel --prod
```

### Option 2: Docker

```bash
docker build -t vedaai .
docker run -p 3000:3000 --env-file .env.local vedaai
```

### Option 3: Node.js server

```bash
npm run build
npm start
```

## Project structure

```
VedaAI/
├── src/app/          Next.js pages & API routes
├── src/components/   UI components
├── src/lib/ai/       Question generation (Meta Llama / Groq / Open WebUI)
├── Dockerfile        Container deployment
└── vercel.json       Vercel config
```
