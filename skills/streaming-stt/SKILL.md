---
name: streaming-stt
description: Streaming speech-to-text adapter: browser Web Speech now; faster-whisper/Whisper-large-v3-turbo local path documented.
tier: A
status: browser-native
allowed-tools:
  - microphone
  - stt
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# streaming-stt

## Purpose

Streaming speech-to-text adapter: browser Web Speech now; faster-whisper/Whisper-large-v3-turbo local path documented.

## Current Jarvis integration

Status: `browser-native`. Tier: `A`.

- Callable from the cockpit through `POST /api/skills/streaming-stt/run`.
- Callable from CLI with `npm run jarvis -- run streaming-stt -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run streaming-stt -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
