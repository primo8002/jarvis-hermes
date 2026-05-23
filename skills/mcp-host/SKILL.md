---
name: mcp-host
description: First-class MCP host plan: register local/remote servers through config and surface tools to Jarvis.
tier: E
status: bridge
allowed-tools:
  - mcp
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# mcp-host

## Purpose

First-class MCP host plan: register local/remote servers through config and surface tools to Jarvis.

## Current Jarvis integration

Status: `bridge`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/mcp-host/run`.
- Callable from CLI with `npm run jarvis -- run mcp-host -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run mcp-host -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
