---
name: emotion-and-sentiment
description: Text sentiment/tone detection feeding adaptive-tone without over-naming emotions.
tier: D
status: native
allowed-tools:
  - text-analysis
  - audio
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# emotion-and-sentiment

## Purpose

Text sentiment/tone detection feeding adaptive-tone without over-naming emotions.

## Current Jarvis integration

Status: `native`. Tier: `D`.

- Callable from the cockpit through `POST /api/skills/emotion-and-sentiment/run`.
- Callable from CLI with `npm run jarvis -- run emotion-and-sentiment -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run emotion-and-sentiment -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
