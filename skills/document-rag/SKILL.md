---
name: document-rag
description: Local document indexing for ~/Documents, PDFs, notes, and code with SQLite/LanceDB hooks.
tier: C
status: planned
allowed-tools:
  - filesystem
  - rag
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# document-rag

## Purpose

Local document indexing for ~/Documents, PDFs, notes, and code with SQLite/LanceDB hooks.

## Current Jarvis integration

Status: `planned`. Tier: `C`.

- Callable from the cockpit through `POST /api/skills/document-rag/run`.
- Callable from CLI with `npm run jarvis -- run document-rag -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run document-rag -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
