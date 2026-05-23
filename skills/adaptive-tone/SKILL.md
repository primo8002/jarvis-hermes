---
name: adaptive-tone
description: Tone router that maps task domain and last utterances to code/business/wellbeing/casual speaking style.
tier: A
status: native
allowed-tools:
  - memory
  - text-analysis
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# adaptive-tone

## Purpose

Tone router that maps task domain and last utterances to code/business/wellbeing/casual speaking style.

## Current Jarvis integration

Status: `native`. Tier: `A`.

- Callable from the cockpit through `POST /api/skills/adaptive-tone/run`.
- Callable from CLI with `npm run jarvis -- run adaptive-tone -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run adaptive-tone -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
