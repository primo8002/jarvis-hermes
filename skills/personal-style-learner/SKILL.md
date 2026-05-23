---
name: personal-style-learner
description: Learns Svanik writing/code/email style locally and exposes a style profile to other skills.
tier: E
status: planned
allowed-tools:
  - memory
  - style
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# personal-style-learner

## Purpose

Learns Svanik writing/code/email style locally and exposes a style profile to other skills.

## Current Jarvis integration

Status: `planned`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/personal-style-learner/run`.
- Callable from CLI with `npm run jarvis -- run personal-style-learner -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run personal-style-learner -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
