---
name: screen-vision
description: Screen OCR/vision capture skill for what-is-this, where-do-I-click, summarize current page, and struggle detection.
tier: A
status: planned
allowed-tools:
  - screenshot
  - ocr
  - vision
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# screen-vision

## Purpose

Screen OCR/vision capture skill for what-is-this, where-do-I-click, summarize current page, and struggle detection.

## Current Jarvis integration

Status: `planned`. Tier: `A`.

- Callable from the cockpit through `POST /api/skills/screen-vision/run`.
- Callable from CLI with `npm run jarvis -- run screen-vision -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run screen-vision -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
