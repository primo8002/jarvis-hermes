---
name: scheduler-and-cron
description: Persistent schedule spec at ~/.jarvis/schedule.json for cron/webhook/file/calendar triggers.
tier: E
status: native
allowed-tools:
  - scheduler
  - cron
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# scheduler-and-cron

## Purpose

Persistent schedule spec at ~/.jarvis/schedule.json for cron/webhook/file/calendar triggers.

## Current Jarvis integration

Status: `native`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/scheduler-and-cron/run`.
- Callable from CLI with `npm run jarvis -- run scheduler-and-cron -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run scheduler-and-cron -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
