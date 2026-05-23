---
name: meeting-recorder
description: Live meeting transcription and action items with Zoom/Meet hooks and local transcript storage.
tier: C
status: planned
allowed-tools:
  - audio
  - calendar
  - zoom
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# meeting-recorder

## Purpose

Live meeting transcription and action items with Zoom/Meet hooks and local transcript storage.

## Current Jarvis integration

Status: `planned`. Tier: `C`.

- Callable from the cockpit through `POST /api/skills/meeting-recorder/run`.
- Callable from CLI with `npm run jarvis -- run meeting-recorder -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run meeting-recorder -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
