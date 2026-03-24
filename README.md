# Skill Vault

Local web app that discovers and displays AI coding tool skills, prompts, and rules across your system.

## Supported Tools

| Tool | Global | Project |
|------|--------|---------|
| Claude Code | `~/.claude/` | `CLAUDE.md`, `.claude/` |
| Agent Skills Registry | `~/.agents/` | — |
| Gemini CLI | `~/.gemini/` | `GEMINI.md` |
| Cursor | — | `.cursorrules`, `.cursor/rules/` |
| GitHub Copilot | `~/.config/github-copilot/` | `.github/copilot-instructions.md` |
| Windsurf | — | `.windsurfrules` |
| Aider | `~/.aider.conf.yml` | `.aider.conf.yml` |
| Cline | — | `.clinerules` |

## Install

### Homebrew (macOS)

```bash
brew install lobmaierleo/tap/skill-vault
```

### npx (requires Bun)

```bash
npx skill-vault
```

### From source

```bash
git clone https://github.com/leolobmaier/SkillOverview.git
cd SkillOverview
bun install
bun run start
```

## Usage

```bash
skill-vault                    # Start server, open browser
skill-vault --port 3000        # Custom port
skill-vault --no-open          # Don't open browser
skill-vault scan               # One-time scan (CLI only)
```

The web UI runs at `http://localhost:7483` by default.

## Features

- Automatic discovery of AI tool configs and skills
- Full-text search across all skills
- Filter by tool, type, scope, and project
- Project folder management (add directories to scan)
- Dark/light theme
- "Reveal in Finder" for any skill file

## Build

Compile to a standalone binary:

```bash
bun run build
```

## Tech Stack

- **Runtime**: Bun
- **Database**: SQLite (bun:sqlite) with FTS5 full-text search
- **Frontend**: Preact + HTM via CDN (no build step)
- **Backend**: Bun.serve (no framework)

## License

MIT
