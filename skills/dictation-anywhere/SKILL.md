---
name: dictation-anywhere
description: Push-to-talk dictation that cleans filler/punctuation and pastes into focused apps.
tier: A
status: planned
allowed-tools:
  - microphone
  - clipboard
  - keyboard
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# dictation-anywhere

## Purpose

Push-to-talk dictation that cleans filler/punctuation and pastes into focused apps.

## Current Jarvis integration

Status: `planned`. Tier: `A`.

- Callable from the cockpit through `POST /api/skills/dictation-anywhere/run`.
- Callable from CLI with `npm run jarvis -- run dictation-anywhere -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run dictation-anywhere -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
