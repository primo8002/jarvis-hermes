# Jarvis Claude Voice Assistant

A local, voice-first AI cockpit for Claude CLI. It has a central animated "mind" orb, microphone/audio visualizations, live reasoning/tool timelines, system telemetry, memory/context panels, and a full-permissions Claude Code bridge for desktop tasks.

## Features implemented

Research-informed Jarvis capability set:
- Voice input and voice output using browser Web Speech APIs.
- Central animated mind circle/orb that reacts to listening, thinking, speaking, and idle states.
- Live transcript, task log, reasoning/tool ticker, streamed response output.
- Claude CLI backend with configurable permission mode; default is bypass permissions for the requested all-computer-control mode.
- System telemetry cards: CPU, memory, disk, battery, OS, process uptime.
- Realtime Claude usage panel updated every 5 seconds from `claude /usage`, direct `https://claude.ai/settings/usage` web percentages, plus local `~/.claude/projects/*.jsonl` token telemetry.
- Visible Desktop Mode: Jarvis can open real desktop browser tabs/windows, open files/folders, and launch a live mission monitor terminal while Claude works.
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
- `JARVIS_USAGE_CACHE_MS=3000` — backend cache for the Claude usage scanner
- `JARVIS_CLAUDE_USAGE_WEB=true|false` — enable direct `https://claude.ai/settings/usage` percentage pulls
- `JARVIS_CLAUDE_USAGE_WEB_CACHE_MS=60000` — cache for the claude.ai usage-page browser pull
- `JARVIS_CLAUDE_USAGE_BROWSER=/usr/bin/brave-browser` — browser executable used for the usage-page pull
- `JARVIS_CLAUDE_USAGE_BROWSER_PROFILE=~/.jarvis/claude-usage-browser` — persistent browser profile for claude.ai login/session
- `JARVIS_CLAUDE_USAGE_HEADLESS=true|false` — set `false` to watch the usage browser; click “Refresh Claude.ai usage” if login is needed
- `JARVIS_VISIBLE_DESKTOP=true|false` — enable visible desktop mission windows by default
- `JARVIS_DESKTOP_LOG_DIR=~/.jarvis/missions` — live mission monitor log directory
- `JARVIS_CLAUDE_5H_TOKEN_LIMIT=7000000` — estimated 5-hour token budget used when `claude /usage` does not expose an exact percentage
- `JARVIS_CLAUDE_WEEKLY_TOKEN_LIMIT=70000000` — estimated weekly token budget used when `claude /usage` does not expose an exact percentage

## Claude usage panel

Jarvis shows a live Claude Usage module in the left rail. It refreshes every 5 seconds in the browser and combines:

1. `https://claude.ai/settings/usage` for direct 5-hour/session and weekly usage percentages. This is preferred whenever the page is accessible.
2. `claude /usage` for the official subscription/usage status text Claude exposes locally.
3. Local Claude Code transcript files under `~/.claude/projects/**/*.jsonl` for token telemetry, model breakdowns, recent activity, today/7-day/30-day/all-time totals, and estimated dollar cost.

The transcript-derived cost is an estimate because Claude subscription quota details are not fully exposed as a stable public API by the CLI. The token counts come from Claude Code's own recorded `message.usage` fields. Limit percentages prefer the direct claude.ai settings page. If the Jarvis usage browser profile is not logged in, the panel shows `login needed`; click `Refresh Claude.ai usage` to open the persistent Jarvis browser profile, log in once, and future refreshes will read the exact page percentages. If the web page is unavailable, Jarvis falls back to `claude /usage` text and then estimated token budgets.

## Visible Desktop Mode

The center controls include a `Visible desktop` toggle. When enabled, every mission starts a visible terminal monitor that tails a live log under `~/.jarvis/missions`, and Jarvis tells Claude Code to open real GUI windows/tabs when useful:

- `xdg-open "https://..."` for websites in the desktop browser.
- `xdg-open /path/to/file` or `xdg-open /path/to/folder` for local files/folders.
- `gnome-terminal -- bash -lc 'command; exec bash'` for long-running visible terminal work.

The `Open desktop tab` button calls `/api/desktop/open` and opens the current Jarvis URL in a desktop browser tab/window. The app still binds only to `127.0.0.1`; do not expose it publicly in bypass mode.

## Notes from quick public research

Public search results for newer "Jarvis" assistants commonly advertise: autonomous real-world tasks, multi-tool usage, desktop app control, media playback, voice I/O, web search, file handling, code writing, document generation, image/content creation, and social-media/video workflows. This implementation builds those as a Claude CLI cockpit rather than as separate brittle one-off scripts: you speak or type the task, and Claude CLI receives full local tool access to carry it out.
