---
name: flight-and-travel
description: Travel parser/status/check-in/expense workflow with explicit network and credential gates.
tier: B
status: planned
allowed-tools:
  - browser
  - email
  - calendar
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# flight-and-travel

## Purpose

Travel parser/status/check-in/expense workflow with explicit network and credential gates.

## Current Jarvis integration

Status: `planned`. Tier: `B`.

- Callable from the cockpit through `POST /api/skills/flight-and-travel/run`.
- Callable from CLI with `npm run jarvis -- run flight-and-travel -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run flight-and-travel -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
