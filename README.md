# Jarvis Claude Voice Assistant

A local, voice-first AI cockpit for Claude CLI. It has a central animated "mind" orb, microphone/audio visualizations, live reasoning/tool timelines, system telemetry, memory/context panels, and a full-permissions Claude Code bridge for desktop tasks.

## Features implemented

Research-informed Jarvis capability set:
- Voice input and voice output using browser Web Speech APIs.
- Central animated mind circle/orb that reacts to listening, thinking, speaking, and idle states.
- Live transcript, task log, reasoning/tool ticker, streamed response output.
- Claude CLI backend with configurable permission mode; default is bypass permissions for the requested all-computer-control mode.
- System telemetry cards: CPU, memory, disk, battery, OS, process uptime.
- Local-only Express + WebSocket bridge; no cloud app server.
- Quick action chips for app control, file work, research, coding, data pulls, calendar/email-style instructions, and web tasks.
- Barge-in: hit Stop or start a new voice command to interrupt an active Claude process.
- Self-correction mode: Jarvis automatically asks Claude to verify/fix its previous answer after a task.
- Data pull mode: commands can ask Claude to search/fetch/process data using its available web/tools.

## Install and run

```bash
cd /home/svanik/Documents/hermes/jarvis-claude-voice
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173
```

The server runs on `http://127.0.0.1:8787`.

## Permission modes

Default:

```bash
JARVIS_PERMISSION_MODE=bypass npm run dev
```

Safer mode:

```bash
JARVIS_PERMISSION_MODE=default npm run dev
```

The backend invokes Claude Code. In bypass mode it uses `--dangerously-skip-permissions`, matching the requested "able to do any and every task" local assistant behavior. Keep it bound to localhost and do not expose this port publicly.

## Environment

Optional:
- `PORT=8787`
- `JARVIS_PERMISSION_MODE=bypass|default|acceptEdits|auto|dontAsk`
- `JARVIS_CLAUDE_MODEL=sonnet|opus|haiku|<full model>`
- `JARVIS_MAX_TURNS=20`
- `JARVIS_OPEN_BROWSER=1`

## Notes from quick public research

Public search results for newer "Jarvis" assistants commonly advertise: autonomous real-world tasks, multi-tool usage, desktop app control, media playback, voice I/O, web search, file handling, code writing, document generation, image/content creation, and social-media/video workflows. This implementation builds those as a Claude CLI cockpit rather than as separate brittle one-off scripts: you speak or type the task, and Claude CLI receives full local tool access to carry it out.
