import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { detectResearchUrl, runVisibleCoworkResearch } from './coworkAutomation.js';

export const REQUIRED_SKILLS = [
  'wake-word-engine', 'streaming-stt', 'neural-tts-voice', 'adaptive-tone', 'screen-vision', 'camera-vision', 'dictation-anywhere', 'persistent-memory', 'proactive-engine', 'interrupt-barge-in',
  'calendar-skill', 'email-triage', 'messaging-bridge', 'task-and-reminder-skill', 'smart-home-skill', 'flight-and-travel', 'nutrition-and-health', 'finance-skill',
  'deep-research', 'code-copilot-skill', 'terminal-operator', 'browser-operator', 'document-rag', 'slide-and-doc-author', 'meeting-recorder',
  'cursor-pebble-ui', '3d-avatar-overlay', 'hud-overlay', 'emotion-and-sentiment', 'wellbeing-coach',
  'mcp-host', 'skill-creator', 'multi-agent-orchestrator', 'scheduler-and-cron', 'sidecar-mesh', 'permission-vault', 'fail-safe-and-undo', 'personal-style-learner',
  'car-mode', 'field-trip-mode', 'dream-journal'
];

const SKILL_META = {
  'wake-word-engine': ['A', 'planned', 'Always-listening wake word engine using openWakeWord/Porcupine with stop interrupt and follow-up mode.', ['microphone', 'audio', 'state-machine']],
  'streaming-stt': ['A', 'browser-native', 'Streaming speech-to-text adapter: browser Web Speech now; faster-whisper/Whisper-large-v3-turbo local path documented.', ['microphone', 'stt']],
  'neural-tts-voice': ['A', 'browser-native', 'Neural/offline TTS plan: current Web Speech output plus Piper/XTTS/Chatterbox runtime hooks.', ['tts', 'audio']],
  'adaptive-tone': ['A', 'native', 'Tone router that maps task domain and last utterances to code/business/wellbeing/casual speaking style.', ['memory', 'text-analysis']],
  'screen-vision': ['A', 'planned', 'Screen OCR/vision capture skill for what-is-this, where-do-I-click, summarize current page, and struggle detection.', ['screenshot', 'ocr', 'vision']],
  'camera-vision': ['A', 'planned', 'Camera frame analysis skill for look-at-this object/context understanding with local-first privacy gates.', ['camera', 'vision']],
  'dictation-anywhere': ['A', 'planned', 'Push-to-talk dictation that cleans filler/punctuation and pastes into focused apps.', ['microphone', 'clipboard', 'keyboard']],
  'persistent-memory': ['A', 'native', 'Local three-layer memory folders under ~/.jarvis/memory with Markdown mirrors and future vector/graph hooks.', ['filesystem', 'sqlite', 'memory']],
  'proactive-engine': ['A', 'planned', 'Local event watcher for calendar/screen/clock triggers that suggests helpful actions.', ['scheduler', 'calendar', 'notifications']],
  'interrupt-barge-in': ['A', 'browser-native', 'Stop/barge-in state protocol for cancelling TTS/Claude process and broadcasting idle/listening/thinking/speaking/working.', ['audio', 'websocket', 'state-machine']],
  'calendar-skill': ['B', 'bridge', 'Calendar read/write/scheduling through Google Workspace/MCP when credentials are enabled.', ['mcp', 'calendar']],
  'email-triage': ['B', 'bridge', 'Gmail/Outlook/iCloud triage/digest/reply drafting through configured MCP/Hermes email tools.', ['mcp', 'email']],
  'messaging-bridge': ['B', 'bridge', 'Unified inbox abstraction for Telegram/Slack/Discord/Signal/iMessage/WhatsApp where connectors exist.', ['mcp', 'messaging']],
  'task-and-reminder-skill': ['B', 'bridge', 'Natural-language tasks/reminders with Notion/Todoist/Reminders integration hooks.', ['mcp', 'tasks']],
  'smart-home-skill': ['B', 'bridge', 'Home Assistant/OpenHue routines for lights, media, thermostat, locks, vacuum, and scenes.', ['mcp', 'home-assistant']],
  'flight-and-travel': ['B', 'planned', 'Travel parser/status/check-in/expense workflow with explicit network and credential gates.', ['browser', 'email', 'calendar']],
  'nutrition-and-health': ['B', 'planned', 'Voice food log and health trend reporting with local-first storage and opt-in wearable imports.', ['health', 'memory']],
  'finance-skill': ['B', 'planned', 'Read-only finance summaries and subscription audits with explicit allow-list before writes.', ['finance', 'audit']],
  'deep-research': ['C', 'native', 'Multi-hop research orchestration using Cowork visible browser automation plus Claude synthesis/citations.', ['browser', 'web', 'claude']],
  'code-copilot-skill': ['C', 'native', 'Project-aware coding orchestrator that delegates heavy work to Claude Code CLI already wired into Jarvis.', ['claude-code', 'git', 'terminal']],
  'terminal-operator': ['C', 'native', 'Visible terminal execution protocol with allow/deny rules, dry-run copy, mission log, and gnome-terminal display.', ['terminal', 'filesystem']],
  'browser-operator': ['C', 'native', 'Visible Brave/Chrome automation built on the Cowork browser endpoint; roadmap includes forms, tabs, and vault login.', ['browser', 'puppeteer']],
  'document-rag': ['C', 'planned', 'Local document indexing for ~/Documents, PDFs, notes, and code with SQLite/LanceDB hooks.', ['filesystem', 'rag']],
  'slide-and-doc-author': ['C', 'bridge', 'Google Docs/Slides/Sheets, Notion, and Markdown brief generation through connected MCP/tools.', ['mcp', 'docs']],
  'meeting-recorder': ['C', 'planned', 'Live meeting transcription and action items with Zoom/Meet hooks and local transcript storage.', ['audio', 'calendar', 'zoom']],
  'cursor-pebble-ui': ['D', 'planned', 'Always-on-top cursor bubble/pebble visualizing Jarvis state.', ['ui', 'overlay']],
  '3d-avatar-overlay': ['D', 'planned', 'Optional VRM/3D avatar with lip sync and eye tracking.', ['ui', 'avatar']],
  'hud-overlay': ['D', 'planned', 'Iron-Man-style transparent HUD for metrics, badges, and on-deck tasks.', ['ui', 'overlay']],
  'emotion-and-sentiment': ['D', 'native', 'Text sentiment/tone detection feeding adaptive-tone without over-naming emotions.', ['text-analysis', 'audio']],
  'wellbeing-coach': ['D', 'planned', 'Posture/screen-time/breath/focus/end-of-day nudges with local opt-in telemetry.', ['vision', 'scheduler']],
  'mcp-host': ['E', 'bridge', 'First-class MCP host plan: register local/remote servers through config and surface tools to Jarvis.', ['mcp']],
  'skill-creator': ['E', 'native', 'Meta-skill for creating agentskills-compatible SKILL.md files after successful workflows.', ['filesystem', 'skills']],
  'multi-agent-orchestrator': ['E', 'native', 'Researcher/coder/planner/reviewer orchestration via Claude Code prompts and future subagent processes.', ['claude-code', 'agents']],
  'scheduler-and-cron': ['E', 'native', 'Persistent schedule spec at ~/.jarvis/schedule.json for cron/webhook/file/calendar triggers.', ['scheduler', 'cron']],
  'sidecar-mesh': ['E', 'planned', 'JWT WebSocket sidecar model for laptop/phone/home-server control from one Jarvis brain.', ['websocket', 'jwt']],
  'permission-vault': ['E', 'native', 'Per-skill allow/deny matrix and audit-log path that complements bypass mode for safer sharing.', ['permissions', 'audit']],
  'fail-safe-and-undo': ['E', 'native', 'Dry-run/snapshot protocol before destructive actions; single-key undo roadmap.', ['filesystem', 'audit']],
  'personal-style-learner': ['E', 'planned', 'Learns Svanik writing/code/email style locally and exposes a style profile to other skills.', ['memory', 'style']],
  'car-mode': ['F', 'planned', 'Bluetooth hands-free voice UI for messaging, email, Spotify, and navigation handoff.', ['bluetooth', 'voice']],
  'field-trip-mode': ['F', 'planned', 'Camera+mic+GPS bundle for outdoor walking narration and memory capture.', ['camera', 'gps', 'audio']],
  'dream-journal': ['F', 'native', 'Voice-only brain-dump/dream-journal capture into ~/.jarvis/memory/diary with searchable Markdown.', ['memory', 'voice']]
};

function skillsDir(root) { return path.join(root, 'skills'); }
function frontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}
function frontmatterList(text, key) {
  const block = text.match(new RegExp(`^${key}:\\s*\\n((?:\\s+- .+\\n?)+)`, 'm'))?.[1] || '';
  return block.split(/\r?\n/).map(line => line.match(/^\s+-\s+(.+)$/)?.[1]?.trim()).filter(Boolean);
}

export function parseSkillMarkdown(markdown, filePath = '') {
  const fm = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const yaml = fm?.[1] || '';
  const body = fm?.[2] || markdown;
  const name = frontmatterValue(yaml, 'name') || path.basename(path.dirname(filePath));
  return {
    name,
    description: frontmatterValue(yaml, 'description'),
    tier: frontmatterValue(yaml, 'tier'),
    status: frontmatterValue(yaml, 'status'),
    allowedTools: frontmatterList(yaml, 'allowed-tools'),
    compatibility: frontmatterList(yaml, 'compatibility'),
    path: filePath,
    body
  };
}

async function maybeReadSkill(root, name) {
  const file = path.join(skillsDir(root), name, 'SKILL.md');
  try { return parseSkillMarkdown(await fs.readFile(file, 'utf8'), file); } catch { return null; }
}

export async function listSkills({ root = process.cwd() } = {}) {
  const entries = [];
  for (const name of REQUIRED_SKILLS) {
    const skill = await maybeReadSkill(root, name);
    if (skill) entries.push(skill);
  }
  return entries.sort((a, b) => `${a.tier}:${a.name}`.localeCompare(`${b.tier}:${b.name}`));
}

export async function getSkill(name, { root = process.cwd() } = {}) {
  const clean = String(name || '').trim();
  const skill = await maybeReadSkill(root, clean);
  if (!skill) throw new Error(`Unknown skill: ${clean}`);
  return skill;
}

function classifyTone(args) {
  const text = args.join(' ').toLowerCase();
  if (/code|bug|test|error|stack|debug|repo|build/.test(text)) return 'surgical, concise, evidence-first engineering tone';
  if (/business|sales|pricing|market|customer|investor|money/.test(text)) return 'pragmatic business tone with tradeoffs and next actions';
  if (/tired|stress|sad|health|sleep|anxious|wellbeing/.test(text)) return 'encouraging, low-friction wellbeing tone';
  return 'dry-witty casual tone with concise confidence';
}

async function ensureMemoryDirs() {
  const base = path.join(os.homedir(), '.jarvis', 'memory');
  const dirs = ['rolling', 'graph', 'diary'].map(d => path.join(base, d));
  await Promise.all(dirs.map(d => fs.mkdir(d, { recursive: true })));
  const index = path.join(base, 'INDEX.md');
  try { await fs.access(index); } catch { await fs.writeFile(index, '# Jarvis Memory\n\n- rolling/: conversation summaries\n- graph/: entity and knowledge graph notes\n- diary/: auto-redacted diary and brain dumps\n'); }
  return { base, dirs, index };
}

export async function runSkill(name, { args = [], root = process.cwd(), body = {} } = {}) {
  let skill;
  try { skill = await getSkill(name, { root }); } catch (error) { return { ok: false, error: String(error?.message || error) }; }
  const joined = args.join(' ');
  if (name === 'adaptive-tone' || name === 'emotion-and-sentiment') return { ok: true, skill: name, summary: `Selected ${classifyTone(args)}.`, tone: classifyTone(args) };
  if (name === 'persistent-memory' || name === 'dream-journal') {
    const mem = await ensureMemoryDirs();
    return { ok: true, skill: name, summary: `Memory store ready at ${mem.base}`, memoryDir: mem.base, index: mem.index };
  }
  if (name === 'browser-operator' || name === 'deep-research') {
    const url = body.url || detectResearchUrl(joined);
    if (url) return await runVisibleCoworkResearch({ url, query: joined || body.query || name, maxScrolls: body.maxScrolls || 4, dwellMs: body.dwellMs || 600 });
    return { ok: true, skill: name, summary: 'Ready: provide a URL/domain to launch visible Cowork browser research.', needs: ['url'] };
  }
  if (name === 'terminal-operator') return { ok: true, skill: name, summary: 'Terminal operator is wired through Claude Code visible desktop mode and /api/desktop/open terminal launches.', args };
  if (name === 'code-copilot-skill' || name === 'multi-agent-orchestrator') return { ok: true, skill: name, summary: 'Code/copilot orchestration is wired through Claude Code CLI in the Jarvis websocket mission runner.', args };
  if (name === 'skill-creator') return { ok: true, skill: name, summary: 'Skill creator can scaffold agentskills-compatible SKILL.md files under ./skills/<name>/SKILL.md.', args };
  if (name === 'scheduler-and-cron') {
    const file = path.join(os.homedir(), '.jarvis', 'schedule.json');
    await fs.mkdir(path.dirname(file), { recursive: true });
    try { await fs.access(file); } catch { await fs.writeFile(file, '[]\n'); }
    return { ok: true, skill: name, summary: `Scheduler spec ready at ${file}`, schedulePath: file };
  }
  if (name === 'permission-vault' || name === 'fail-safe-and-undo') {
    const file = path.join(os.homedir(), '.jarvis', name === 'permission-vault' ? 'permissions.json' : 'undo-log.jsonl');
    await fs.mkdir(path.dirname(file), { recursive: true });
    return { ok: true, skill: name, summary: `${skill.description} Runtime path: ${file}`, path: file };
  }
  return { ok: true, skill: name, summary: `${skill.name} is installed as a ${skill.status} Jarvis skill. ${skill.description}`, status: skill.status, tier: skill.tier };
}

export function skillTemplate(name) {
  const [tier, status, description, tools] = SKILL_META[name] || ['Z', 'planned', 'Jarvis skill.', ['jarvis']];
  return `---\nname: ${name}\ndescription: ${description}\ntier: ${tier}\nstatus: ${status}\nallowed-tools:\n${tools.map(t => `  - ${t}`).join('\n')}\ncompatibility:\n  - jarvis\n  - claude-code\n  - hermes\n  - agentskills.io-v1\n---\n# ${name}\n\n## Purpose\n\n${description}\n\n## Current Jarvis integration\n\nStatus: \`${status}\`. Tier: \`${tier}\`.\n\n- Callable from the cockpit through \`POST /api/skills/${name}/run\`.\n- Callable from CLI with \`npm run jarvis -- run ${name} -- <args>\`.\n- Logs and persistent state live under \`~/.jarvis/\` when this skill touches state.\n- New external/cloud access must stay opt-in and credential-gated.\n\n## Demo\n\n\`\`\`bash\nnpm run jarvis -- run ${name} -- demo\n\`\`\`\n\n## Safety\n\n- Local-first by default.\n- Bind network listeners to \`127.0.0.1\` unless Svanik explicitly changes a flag.\n- For destructive changes outside this repo or \`~/.jarvis\`, ask for confirmation and write an audit entry.\n\n## Implementation notes\n\nThis skill is adjusted to the current Jarvis cockpit: React/Vite client, Node/Express server, Claude Code CLI bridge, visible desktop mission monitor, and Cowork browser automation.\n`;
}

export async function ensureSkillLibrary({ root = process.cwd() } = {}) {
  await fs.mkdir(skillsDir(root), { recursive: true });
  for (const name of REQUIRED_SKILLS) {
    const dir = path.join(skillsDir(root), name);
    const file = path.join(dir, 'SKILL.md');
    await fs.mkdir(dir, { recursive: true });
    try { await fs.access(file); } catch { await fs.writeFile(file, skillTemplate(name)); }
  }
  const index = ['# Jarvis Skills Index', '', ...REQUIRED_SKILLS.map(name => {
    const [tier, status, description] = SKILL_META[name];
    return `- [${name}](./${name}/SKILL.md) — Tier ${tier}, ${status}. ${description}`;
  }), ''].join('\n');
  await fs.writeFile(path.join(skillsDir(root), 'INDEX.md'), index);
}
