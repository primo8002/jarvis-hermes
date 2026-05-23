---
name: slide-and-doc-author
description: Google Docs/Slides/Sheets, Notion, and Markdown brief generation through connected MCP/tools.
tier: C
status: bridge
allowed-tools:
  - mcp
  - docs
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# slide-and-doc-author

## Purpose

Google Docs/Slides/Sheets, Notion, and Markdown brief generation through connected MCP/tools.

## Current Jarvis integration

Status: `bridge`. Tier: `C`.

- Callable from the cockpit through `POST /api/skills/slide-and-doc-author/run`.
- Callable from CLI with `npm run jarvis -- run slide-and-doc-author -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run slide-and-doc-author -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
