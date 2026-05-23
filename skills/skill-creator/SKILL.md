---
name: skill-creator
description: Meta-skill for creating agentskills-compatible SKILL.md files after successful workflows.
tier: E
status: native
allowed-tools:
  - filesystem
  - skills
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# skill-creator

## Purpose

Meta-skill for creating agentskills-compatible SKILL.md files after successful workflows.

## Current Jarvis integration

Status: `native`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/skill-creator/run`.
- Callable from CLI with `npm run jarvis -- run skill-creator -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run skill-creator -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
