# VedaAI — AI Assessment Creator (Frontend)

Next.js dashboard for creating assignments, viewing generated question papers, and managing class workflows.

## Quick Start

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### Windows — new terminal window

```bash
npm run dev:window
```

Or double-click `scripts/start-frontend-new-window.bat`.

## Scripts (project root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend |
| `npm run dev:window` | Frontend in a new window |
| `npm install` / `npm run install:all` | Install frontend dependencies |

## Environment (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

Point these at your API server if you run one separately.

## Project structure

```
vedaAI/
├── frontend/          Next.js app
└── scripts/           Windows launchers
```
