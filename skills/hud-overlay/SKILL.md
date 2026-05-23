---
name: hud-overlay
description: Iron-Man-style transparent HUD for metrics, badges, and on-deck tasks.
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
# hud-overlay

## Purpose

Iron-Man-style transparent HUD for metrics, badges, and on-deck tasks.

## Current Jarvis integration

Status: `planned`. Tier: `D`.

- Callable from the cockpit through `POST /api/skills/hud-overlay/run`.
- Callable from CLI with `npm run jarvis -- run hud-overlay -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run hud-overlay -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
