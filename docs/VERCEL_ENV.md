# Fix “AI key not configured” on Vercel

Production: [vedaai-omega.vercel.app](https://vedaai-omega.vercel.app/create)

## 1. Open the correct Vercel project

Vercel → project linked to **gokul143-h/VedaAI** (not a different team project).

## 2. Add environment variables

**Settings → Environment Variables** → add for **Production**, **Preview**, and **Development**:

| Name | Value |
|------|--------|
| `GROQ_API_KEY` | Your key from [console.groq.com/keys](https://console.groq.com/keys) (starts with `gsk_`) |
| `AI_PROVIDER` | `groq` |
| `USE_MOCK_AI` | `false` |
| `OPENAI_MODEL` | `llama-3.3-70b-versatile` |

Optional (Render backend):

| Name | Value |
|------|--------|
| `BACKEND_API_URL` | `https://vedaai-api.onrender.com` |
| `NEXT_PUBLIC_API_URL` | same |
| `NEXT_PUBLIC_WS_URL` | `wss://vedaai-api.onrender.com/ws` |

**Do not** set `NEXT_PUBLIC_API_URL=http://localhost:4000` on Vercel.

## 3. Redeploy

**Deployments** → latest → **⋯** → **Redeploy**.

## 4. Verify

```text
https://vedaai-omega.vercel.app/api/ai/health
```

Expected: `"useMockAi": false`, `"hasApiKey": true`, `"model": "llama-3.3-70b-versatile"`

## CLI (optional)

From `VedaAI/` folder:

```powershell
.\scripts\setup-vercel-env.ps1 -ApiKey "gsk_YOUR_KEY" -Provider groq
npx vercel --prod
```

Link the CLI to the **vedaai-omega** project first: `npx vercel link`
