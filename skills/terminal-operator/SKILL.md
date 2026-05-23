---
name: terminal-operator
description: Visible terminal execution protocol with allow/deny rules, dry-run copy, mission log, and gnome-terminal display.
tier: C
status: native
allowed-tools:
  - terminal
  - filesystem
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# terminal-operator

## Purpose

Visible terminal execution protocol with allow/deny rules, dry-run copy, mission log, and gnome-terminal display.

## Current Jarvis integration

Status: `native`. Tier: `C`.

- Callable from the cockpit through `POST /api/skills/terminal-operator/run`.
- Callable from CLI with `npm run jarvis -- run terminal-operator -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run terminal-operator -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
