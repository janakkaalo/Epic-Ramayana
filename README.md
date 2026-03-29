# Epic Ramayana Monorepo

TypeScript pnpm workspace containing the Ramayana game, API server, and shared libraries.

## Prerequisites

- Node.js 22+ (24 recommended)
- pnpm 10+

## Install

```bash
pnpm install
```

## Run The Main App (Ramayana Game)

```bash
pnpm --filter @workspace/ramayana-game run dev
```

Then open http://localhost:5173.

## Build Everything

```bash
pnpm run build
```

## Optional: Run API Server

```bash
pnpm --filter @workspace/api-server run dev
```

Health endpoint: http://localhost:3000/api/health

## Environment Files

These defaults are already included for local development:

- `artifacts/ramayana-game/.env`
- `artifacts/mockup-sandbox/.env`
- `artifacts/api-server/.env`

Template files are also included:

- `artifacts/ramayana-game/.env.example`
- `artifacts/mockup-sandbox/.env.example`
- `artifacts/api-server/.env.example`
- `lib/db/.env.example`

## Troubleshooting

- If install fails, use `pnpm install` (not npm/yarn).
- If a port is in use, change `PORT` in the relevant `.env` file.
- On Windows PowerShell/CMD, no Git Bash is required for this workspace.
