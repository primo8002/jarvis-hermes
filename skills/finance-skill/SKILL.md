---
name: finance-skill
description: Read-only finance summaries and subscription audits with explicit allow-list before writes.
tier: B
status: planned
allowed-tools:
  - finance
  - audit
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# finance-skill

## Purpose

Read-only finance summaries and subscription audits with explicit allow-list before writes.

## Current Jarvis integration

Status: `planned`. Tier: `B`.

- Callable from the cockpit through `POST /api/skills/finance-skill/run`.
- Callable from CLI with `npm run jarvis -- run finance-skill -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run finance-skill -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
