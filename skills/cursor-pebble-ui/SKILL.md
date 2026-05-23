---
name: cursor-pebble-ui
description: Always-on-top cursor bubble/pebble visualizing Jarvis state.
tier: D
status: planned
allowed-tools:
  - ui
  - overlay
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# cursor-pebble-ui

## Purpose

Always-on-top cursor bubble/pebble visualizing Jarvis state.

## Current Jarvis integration

Status: `planned`. Tier: `D`.

- Callable from the cockpit through `POST /api/skills/cursor-pebble-ui/run`.
- Callable from CLI with `npm run jarvis -- run cursor-pebble-ui -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run cursor-pebble-ui -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
