---
name: smart-home-skill
description: Home Assistant/OpenHue routines for lights, media, thermostat, locks, vacuum, and scenes.
tier: B
status: bridge
allowed-tools:
  - mcp
  - home-assistant
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# smart-home-skill

## Purpose

Home Assistant/OpenHue routines for lights, media, thermostat, locks, vacuum, and scenes.

## Current Jarvis integration

Status: `bridge`. Tier: `B`.

- Callable from the cockpit through `POST /api/skills/smart-home-skill/run`.
- Callable from CLI with `npm run jarvis -- run smart-home-skill -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run smart-home-skill -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
