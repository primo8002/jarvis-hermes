---
name: fail-safe-and-undo
description: Dry-run/snapshot protocol before destructive actions; single-key undo roadmap.
tier: E
status: native
allowed-tools:
  - filesystem
  - audit
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# fail-safe-and-undo

## Purpose

Dry-run/snapshot protocol before destructive actions; single-key undo roadmap.

## Current Jarvis integration

Status: `native`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/fail-safe-and-undo/run`.
- Callable from CLI with `npm run jarvis -- run fail-safe-and-undo -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run fail-safe-and-undo -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
