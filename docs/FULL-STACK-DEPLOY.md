# Full-stack deployment

Frontend: **Vercel** → [https://vedaai-omega.vercel.app](https://vedaai-omega.vercel.app)  
Backend: **Render** → [vedaAI-backend](https://github.com/gokul143-h/vedaAI-backend)

The frontend talks to the backend through the same site via `/api/backend/*` (Vercel proxy). WebSocket progress uses `wss://your-backend.onrender.com/ws`.

## 1. Deploy backend (Render)

1. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and copy the connection string.
2. Get a free [Groq API key](https://console.groq.com/keys) for Llama generation.
3. Deploy backend:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/gokul143-h/vedaAI-backend)

4. In Render, set:
   - `MONGODB_URI` — Atlas connection string
   - `GROQ_API_KEY` — Groq key
   - `CORS_ORIGIN` — `https://vedaai-omega.vercel.app`

5. Copy your Render URL, e.g. `https://vedaai-api.onrender.com`

Verify:

```bash
curl https://YOUR-SERVICE.onrender.com/health
```

Expected: `"ready": true`, `"mongodb": "up"`

## 2. Connect frontend (Vercel)

PowerShell:

```powershell
.\scripts\connect-backend.ps1 -BackendUrl "https://vedaai-api.onrender.com" -GroqApiKey "gsk_..."
npx vercel --prod
```

Or set in [Vercel env vars](https://vercel.com):

| Variable | Example |
|----------|---------|
| `BACKEND_API_URL` | `https://vedaai-api.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `https://vedaai-api.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | `wss://vedaai-api.onrender.com/ws` |
| `GROQ_API_KEY` | `gsk_...` (fallback AI on Vercel) |
| `USE_MOCK_AI` | `false` |

## 3. How it works

```
Browser (vedaai-omega.vercel.app)
  ├── POST /api/backend/api/assignments  →  Vercel proxy  →  Render API
  ├── GET  /api/backend/health           →  Vercel proxy  →  Render API
  └── WS   wss://vedaai-api.onrender.com/ws  (live progress)
```

If the backend is down, the frontend falls back to built-in `/api/ai/generate`.

## 4. Local dev (both services)

Terminal 1 — backend:

```bash
cd ../vedaAI-backend
npm install && cp .env.example .env
npm run infra   # MongoDB + Redis via Docker
npm run dev
```

Terminal 2 — frontend:

```bash
npm run dev
```

Frontend uses `http://localhost:4000` automatically on localhost.
