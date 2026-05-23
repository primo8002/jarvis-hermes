---
name: dream-journal
description: Voice-only brain-dump/dream-journal capture into ~/.jarvis/memory/diary with searchable Markdown.
tier: F
status: native
allowed-tools:
  - memory
  - voice
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# dream-journal

## Purpose

Voice-only brain-dump/dream-journal capture into ~/.jarvis/memory/diary with searchable Markdown.

## Current Jarvis integration

Status: `native`. Tier: `F`.

- Callable from the cockpit through `POST /api/skills/dream-journal/run`.
- Callable from CLI with `npm run jarvis -- run dream-journal -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run dream-journal -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
