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
AI_PROVIDER=openwebui
OPENWEBUI_BASE_URL=http://localhost:8080/api
OPENWEBUI_API_KEY=your-key
OPENAI_MODEL=GPT-5.5
USE_MOCK_AI=false
```

For Groq instead of Open WebUI, set `AI_PROVIDER=groq` and `GROQ_API_KEY`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production server locally |

## Deploy

### Option 1: Vercel (recommended)

1. Push this repo to GitHub: [https://github.com/gokul143-h/VedaAI](https://github.com/gokul143-h/VedaAI)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variables in Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `AI_PROVIDER` | `openwebui` or `groq` |
| `OPENWEBUI_BASE_URL` | Your Open WebUI URL + `/api` |
| `OPENWEBUI_API_KEY` | API key from Open WebUI |
| `OPENAI_MODEL` | e.g. `GPT-5.5` |
| `USE_MOCK_AI` | `false` |

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
├── src/lib/ai/       Question generation (Open WebUI / Groq)
├── Dockerfile        Container deployment
└── vercel.json       Vercel config
```
