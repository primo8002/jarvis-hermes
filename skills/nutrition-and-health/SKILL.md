---
name: nutrition-and-health
description: Voice food log and health trend reporting with local-first storage and opt-in wearable imports.
tier: B
status: planned
allowed-tools:
  - health
  - memory
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# nutrition-and-health

## Purpose

Voice food log and health trend reporting with local-first storage and opt-in wearable imports.

## Current Jarvis integration

Status: `planned`. Tier: `B`.

- Callable from the cockpit through `POST /api/skills/nutrition-and-health/run`.
- Callable from CLI with `npm run jarvis -- run nutrition-and-health -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run nutrition-and-health -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
