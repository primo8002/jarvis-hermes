---
name: sidecar-mesh
description: JWT WebSocket sidecar model for laptop/phone/home-server control from one Jarvis brain.
tier: E
status: planned
allowed-tools:
  - websocket
  - jwt
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# sidecar-mesh

## Purpose

JWT WebSocket sidecar model for laptop/phone/home-server control from one Jarvis brain.

## Current Jarvis integration

Status: `planned`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/sidecar-mesh/run`.
- Callable from CLI with `npm run jarvis -- run sidecar-mesh -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run sidecar-mesh -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
