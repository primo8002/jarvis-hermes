---
name: camera-vision
description: Camera frame analysis skill for look-at-this object/context understanding with local-first privacy gates.
tier: A
status: planned
allowed-tools:
  - camera
  - vision
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# camera-vision

## Purpose

Camera frame analysis skill for look-at-this object/context understanding with local-first privacy gates.

## Current Jarvis integration

Status: `planned`. Tier: `A`.

- Callable from the cockpit through `POST /api/skills/camera-vision/run`.
- Callable from CLI with `npm run jarvis -- run camera-vision -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run camera-vision -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
