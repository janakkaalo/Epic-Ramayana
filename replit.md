# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Game engine**: Canvas 2D with custom pseudo-3D perspective rendering

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── ramayana-game/      # Main Ramayana Action-RPG game (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Ramayana Game

- **Path**: `artifacts/ramayana-game/`
- **Preview path**: `/` (root)
- **Stack**: React + Vite, Canvas 2D pseudo-3D rendering, Zustand state management
- **Dependencies**: Three.js, Cannon-es (installed), Zustand
- **Game files**:
  - `src/game/types.ts` — TypeScript types for all game entities
  - `src/game/characters.ts` — All character stats, tiers, astras, siddhis
  - `src/game/levels.ts` — All 13 levels across 5 acts + act metadata
  - `src/game/store.ts` — Zustand global game state machine
  - `src/components/game/MainMenu.tsx` — Animated main menu with starfield + divine rays
  - `src/components/game/GameCanvas.tsx` — Main game canvas with enemy AI, combat, particles
  - `src/components/game/HUD.tsx` — HP/Mana/Dharma bars, Astra hotbar, boss health
  - `src/components/game/CutscenePanel.tsx` — Typewriter narrative dialogue system
  - `src/components/game/ActMap.tsx` — Journey map with all 5 acts and 13 levels
  - `src/components/game/CharacterScreen.tsx` — Character codex with all stats
  - `src/components/game/VictoryScreen.tsx` — Fireworks victory screen
  - `src/components/game/Navbar.tsx` — Navigation + pause menu
  - `src/App.tsx` — Root game router
  - `src/index.css` — Dark golden theme CSS variables

## Game Features

### Acts & Narrative
1. **Act I - Bala Kanda**: Ayodhya → Training → Tataka boss → Shiva Bow puzzle
2. **Act II - Aranya Kanda**: Exile → Dandaka Forest → Khara/Dushana battle → Golden Deer (Maricha)
3. **Act III - Kishkindha Kanda**: Vali moral choice → Hanuman's ocean leap
4. **Act IV - Sundara Kanda**: Lanka infiltration → Lanka Dahan (burning) → Nala Setu bridge
5. **Act V - Yuddha Kanda**: Indrajit boss → Kumbhakarna giant → Ravana 10-head final boss

### Characters
- **Playable**: Rama (Atimaharathi), Hanuman (Atimaharathi), Lakshmana (Maharathi)
- **Bosses**: Tataka, Khara, Dushana, Vali, Indrajit, Kumbhakarna, Ravana
- **Tier system**: Rathi → Atirathi → Maharathi → Atimaharathi → Mahamaharathi

### Systems
- **Dharma Score**: 0-100 scale, affected by player choices
- **Karma Weight**: Accumulated through morally ambiguous actions (e.g., slaying Vali from hiding)
- **Astra System**: 8 divine weapons (Brahmastra, Agneyastra, etc.)
- **Siddhi System**: 8 divine powers for Hanuman (Anima, Mahima, etc.)
- **Enemy AI**: Patrol/Combat state machine with attack cooldowns
- **Particle system**: Explosions, divine light effects, environmental particles
- **Pseudo-3D rendering**: Perspective projection with depth sorting

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
