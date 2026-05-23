---
name: 3d-avatar-overlay
description: Optional VRM/3D avatar with lip sync and eye tracking.
tier: D
status: planned
allowed-tools:
  - ui
  - avatar
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# 3d-avatar-overlay

## Purpose

Optional VRM/3D avatar with lip sync and eye tracking.

## Current Jarvis integration

Status: `planned`. Tier: `D`.

- Callable from the cockpit through `POST /api/skills/3d-avatar-overlay/run`.
- Callable from CLI with `npm run jarvis -- run 3d-avatar-overlay -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run 3d-avatar-overlay -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
