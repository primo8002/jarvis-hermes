---
name: interrupt-barge-in
description: Stop/barge-in state protocol for cancelling TTS/Claude process and broadcasting idle/listening/thinking/speaking/working.
tier: A
status: browser-native
allowed-tools:
  - audio
  - websocket
  - state-machine
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# interrupt-barge-in

## Purpose

Stop/barge-in state protocol for cancelling TTS/Claude process and broadcasting idle/listening/thinking/speaking/working.

## Current Jarvis integration

Status: `browser-native`. Tier: `A`.

- Callable from the cockpit through `POST /api/skills/interrupt-barge-in/run`.
- Callable from CLI with `npm run jarvis -- run interrupt-barge-in -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run interrupt-barge-in -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
