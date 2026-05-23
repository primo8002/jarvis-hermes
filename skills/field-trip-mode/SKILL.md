---
name: field-trip-mode
description: Camera+mic+GPS bundle for outdoor walking narration and memory capture.
tier: F
status: planned
allowed-tools:
  - camera
  - gps
  - audio
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# field-trip-mode

## Purpose

Camera+mic+GPS bundle for outdoor walking narration and memory capture.

## Current Jarvis integration

Status: `planned`. Tier: `F`.

- Callable from the cockpit through `POST /api/skills/field-trip-mode/run`.
- Callable from CLI with `npm run jarvis -- run field-trip-mode -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run field-trip-mode -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
