---
name: wellbeing-coach
description: Posture/screen-time/breath/focus/end-of-day nudges with local opt-in telemetry.
tier: D
status: planned
allowed-tools:
  - vision
  - scheduler
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# wellbeing-coach

## Purpose

Posture/screen-time/breath/focus/end-of-day nudges with local opt-in telemetry.

## Current Jarvis integration

Status: `planned`. Tier: `D`.

- Callable from the cockpit through `POST /api/skills/wellbeing-coach/run`.
- Callable from CLI with `npm run jarvis -- run wellbeing-coach -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run wellbeing-coach -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
