---
name: deep-research
description: Multi-hop research orchestration using Cowork visible browser automation plus Claude synthesis/citations.
tier: C
status: native
allowed-tools:
  - browser
  - web
  - claude
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# deep-research

## Purpose

Multi-hop research orchestration using Cowork visible browser automation plus Claude synthesis/citations.

## Current Jarvis integration

Status: `native`. Tier: `C`.

- Callable from the cockpit through `POST /api/skills/deep-research/run`.
- Callable from CLI with `npm run jarvis -- run deep-research -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run deep-research -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
