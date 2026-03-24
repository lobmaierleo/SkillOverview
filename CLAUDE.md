# Skill Vault

Lokale Web-App zur Erkennung und Darstellung von AI-Coding-Tool Skills/Prompts/Rules.

## Tech Stack

- **Runtime**: Bun (TypeScript)
- **Backend**: `Bun.serve()` — kein Express/Hono
- **Datenbank**: `bun:sqlite` — kein better-sqlite3
- **Frontend**: Preact + HTM via CDN (kein Build-Step, kein Vite)
- **Styling**: Custom CSS mit CSS Custom Properties

## Befehle

```sh
bun run dev          # Dev-Server mit Watch-Mode
bun run start        # Produktion starten
bun run build        # Single Binary kompilieren
bun run typecheck    # TypeScript prüfen
```

## Architektur

- `src/cli.ts` — Entry-Point, CLI-Flags, Server-Start
- `src/server.ts` — HTTP-Server (API + Static-Files)
- `src/db.ts` — SQLite-Schema, Queries, FTS5
- `src/scanner/` — Plugin-basiertes Tool-Discovery
  - `types.ts` — Zentrale Interfaces
  - `helpers.ts` — Datei-Lese-/Parse-Utilities
  - `index.ts` — Orchestrator
  - `plugins/*.ts` — Ein Scanner pro Tool (claude, gemini, cursor, copilot, windsurf, aider, cline, agents)
- `src/api/` — REST-API-Handler
- `src/frontend/` — SPA (Preact+HTM, kein Build)

## Konventionen

- Bun-APIs bevorzugen (`Bun.file`, `Bun.serve`, `bun:sqlite`)
- Keine externen Dependencies für Backend (Zero-Dep)
- Frontend via CDN-Imports (Preact, HTM)
- Scanner-Plugins implementieren `ScannerPlugin` Interface aus `types.ts`
- Daten lokal in `~/.skill-vault/data.db`
