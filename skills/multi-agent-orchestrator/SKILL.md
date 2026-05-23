---
name: multi-agent-orchestrator
description: Researcher/coder/planner/reviewer orchestration via Claude Code prompts and future subagent processes.
tier: E
status: native
allowed-tools:
  - claude-code
  - agents
compatibility:
  - jarvis
  - claude-code
  - hermes
  - agentskills.io-v1
---
# multi-agent-orchestrator

## Purpose

Researcher/coder/planner/reviewer orchestration via Claude Code prompts and future subagent processes.

## Current Jarvis integration

Status: `native`. Tier: `E`.

- Callable from the cockpit through `POST /api/skills/multi-agent-orchestrator/run`.
- Callable from CLI with `npm run jarvis -- run multi-agent-orchestrator -- <args>`.
- Logs and persistent state live under `~/.jarvis/` when this skill touches state.
- New external/cloud access must stay opt-in and credential-gated.

## Demo

```bash
npm run jarvis -- run multi-agent-orchestrator -- demo
```

## Safety

- Local-first by default.
- Bind network listeners to `127.0.0.1` unless Svanik explicitly changes a flag.
- For destructive changes outside this repo or `~/.jarvis`, ask for confirmation and write an audit entry.

## Implementation notes

This skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.
