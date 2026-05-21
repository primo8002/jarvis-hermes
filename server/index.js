import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { spawn, execFile } from 'child_process';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import si from 'systeminformation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8787);
const permissionMode = process.env.JARVIS_PERMISSION_MODE || 'bypass';
const model = process.env.JARVIS_CLAUDE_MODEL || '';
const maxTurns = process.env.JARVIS_MAX_TURNS || '20';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, name: 'Jarvis', root: ROOT, permissionMode, model: model || 'claude default', port: PORT });
});


const CLAUDE_HOME = process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude');
const CLAUDE_PROJECTS_DIR = path.join(CLAUDE_HOME, 'projects');
const USAGE_CACHE_MS = Number(process.env.JARVIS_USAGE_CACHE_MS || 3000);
let usageCache = { at: 0, data: null };
let usageCliCache = { at: 0, text: '' };

function emptyTokenBucket() {
  return { input: 0, output: 0, cacheCreation: 0, cacheRead: 0, total: 0, messages: 0, estimatedCostUsd: 0 };
}

function addUsage(target, usage, model) {
  const input = usage.input_tokens || 0;
  const output = usage.output_tokens || 0;
  const cacheCreation = usage.cache_creation_input_tokens || 0;
  const cacheRead = usage.cache_read_input_tokens || 0;
  target.input += input;
  target.output += output;
  target.cacheCreation += cacheCreation;
  target.cacheRead += cacheRead;
  target.total += input + output + cacheCreation + cacheRead;
  target.messages += 1;
  target.estimatedCostUsd += estimateClaudeCost(model, { input, output, cacheCreation, cacheRead });
}

function estimateClaudeCost(model = '', usage) {
  const m = String(model).toLowerCase();
  let inputPerM = 3, outputPerM = 15;
  if (m.includes('opus')) { inputPerM = 15; outputPerM = 75; }
  else if (m.includes('haiku')) { inputPerM = 0.8; outputPerM = 4; }
  else if (m.includes('sonnet')) { inputPerM = 3; outputPerM = 15; }
  const cacheWritePerM = inputPerM * 1.25;
  const cacheReadPerM = inputPerM * 0.1;
  return ((usage.input * inputPerM) + (usage.output * outputPerM) + (usage.cacheCreation * cacheWritePerM) + (usage.cacheRead * cacheReadPerM)) / 1_000_000;
}

function dayKey(date) {
  return new Date(date).toLocaleDateString('en-CA');
}

async function walkJsonlFiles(dir) {
  const out = [];
  async function walk(current) {
    let entries = [];
    try { entries = await fs.readdir(current, { withFileTypes: true }); } catch { return; }
    await Promise.all(entries.map(async (entry) => {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) return walk(full);
      if (entry.isFile() && entry.name.endsWith('.jsonl')) out.push(full);
    }));
  }
  await walk(dir);
  return out;
}

async function runClaudeUsageCommand() {
  if (Date.now() - usageCliCache.at < 60_000) return usageCliCache.text;
  const text = await new Promise((resolve) => {
    execFile('bash', ['-lc', 'claude /usage < /dev/null'], { timeout: 7000, cwd: ROOT }, (error, stdout, stderr) => {
      const raw = String(stdout || stderr || error?.message || 'Claude /usage unavailable');
      resolve(raw.split(/\r?\n/).filter(line => !line.startsWith('Warning: no stdin data received')).join('\n').trim());
    });
  });
  usageCliCache = { at: Date.now(), text };
  return text;
}

async function collectClaudeUsage() {
  if (usageCache.data && Date.now() - usageCache.at < USAGE_CACHE_MS) return usageCache.data;
  const now = new Date();
  const today = dayKey(now);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const totals = emptyTokenBucket();
  const todayTotals = emptyTokenBucket();
  const weekTotals = emptyTokenBucket();
  const monthTotals = emptyTokenBucket();
  const byModel = {};
  const byDay = {};
  const recent = [];
  const seenMessageIds = new Set();
  let filesScanned = 0;
  let lastActivity = null;

  const files = await walkJsonlFiles(CLAUDE_PROJECTS_DIR);
  filesScanned = files.length;
  await Promise.all(files.map(async (file) => {
    let content = '';
    try { content = await fs.readFile(file, 'utf8'); } catch { return; }
    for (const line of content.split(/\r?\n/)) {
      if (!line.trim()) continue;
      let row;
      try { row = JSON.parse(line); } catch { continue; }
      const msg = row.message;
      const usage = msg?.usage;
      const modelName = msg?.model || row.model || 'unknown';
      if (!usage || row.type !== 'assistant' || modelName === '<synthetic>') continue;
      const messageId = msg.id || row.uuid;
      if (messageId && seenMessageIds.has(messageId)) continue;
      if (messageId) seenMessageIds.add(messageId);
      const ts = row.timestamp ? new Date(row.timestamp) : null;
      const tsMs = ts?.getTime?.() || 0;
      if (tsMs && (!lastActivity || tsMs > new Date(lastActivity).getTime())) lastActivity = ts.toISOString();

      addUsage(totals, usage, modelName);
      if (!byModel[modelName]) byModel[modelName] = emptyTokenBucket();
      addUsage(byModel[modelName], usage, modelName);
      if (ts) {
        const key = dayKey(ts);
        if (!byDay[key]) byDay[key] = emptyTokenBucket();
        addUsage(byDay[key], usage, modelName);
        if (key === today) addUsage(todayTotals, usage, modelName);
        if (tsMs >= sevenDaysAgo) addUsage(weekTotals, usage, modelName);
        if (tsMs >= thirtyDaysAgo) addUsage(monthTotals, usage, modelName);
        recent.push({ at: ts.toISOString(), model: modelName, tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0), output: usage.output_tokens || 0 });
      }
    }
  }));

  const cliText = await runClaudeUsageCommand();
  const data = {
    ok: true,
    source: 'Claude CLI /usage + ~/.claude/projects JSONL transcript telemetry',
    refreshedAt: now.toISOString(),
    cliText,
    lastActivity,
    filesScanned,
    totals,
    today: todayTotals,
    week: weekTotals,
    month: monthTotals,
    byModel: Object.entries(byModel).sort((a, b) => b[1].total - a[1].total).slice(0, 8).map(([model, data]) => ({ model, ...data })),
    byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([day, data]) => ({ day, ...data })),
    recent: recent.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8),
    note: 'Token/cost numbers are local estimates from Claude Code transcript usage fields; subscription quota/limit text comes from claude /usage when available.'
  };
  usageCache = { at: Date.now(), data };
  return data;
}

app.get('/api/system', async (_req, res) => {
  try {
    const [cpu, mem, fs, battery, osInfo, load, processes] = await Promise.all([
      si.cpu(), si.mem(), si.fsSize(), si.battery(), si.osInfo(), si.currentLoad(), si.processes()
    ]);
    const mainDisk = fs.sort((a, b) => (b.size || 0) - (a.size || 0))[0] || {};
    res.json({
      host: os.hostname(),
      platform: `${osInfo.distro || os.platform()} ${osInfo.release || ''}`.trim(),
      arch: os.arch(),
      cpu: { brand: cpu.brand, cores: cpu.cores, load: load.currentLoad },
      memory: { total: mem.total, used: mem.active, free: mem.available },
      disk: { fs: mainDisk.fs, mount: mainDisk.mount, size: mainDisk.size, used: mainDisk.used, use: mainDisk.use },
      battery: { hasBattery: battery.hasBattery, percent: battery.percent, isCharging: battery.isCharging },
      processes: { all: processes.all, running: processes.running },
      uptime: os.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: String(error?.message || error) });
  }
});


app.get('/api/claude-usage', async (_req, res) => {
  try {
    res.json(await collectClaudeUsage());
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error?.message || error) });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(ROOT, 'dist')));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(ROOT, 'dist', 'index.html')));
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/assistant' });
const running = new Map();

function buildClaudeArgs(payload) {
  const args = ['-p', payload.prompt, '--output-format', 'stream-json', '--verbose', '--max-turns', String(payload.maxTurns || maxTurns)];
  if (permissionMode === 'bypass') args.push('--dangerously-skip-permissions');
  else if (permissionMode && permissionMode !== 'default') args.push('--permission-mode', permissionMode);
  if (model) args.push('--model', model);
  return args;
}

function jarvisPrompt(userText, options = {}) {
  return `You are Jarvis, Svanik's local voice-first AI assistant running through Claude Code CLI on his computer.\n\nCapabilities expected:\n- Use the computer, filesystem, terminal, code tools, and available web/data tools to complete the user's task.\n- Be autonomous, practical, and concise.\n- For dangerous irreversible actions, verify intent if needed, but otherwise execute tasks end-to-end.\n- Report what you did and any paths, commands, or data sources used.\n- If asked to pull data, fetch current data and summarize with source context.\n\nSession switches:\n- selfCorrection=${options.selfCorrection ? 'enabled' : 'disabled'}\n- spokenMode=true\n\nUser command:\n${userText}`;
}

function send(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: Date.now(), ...obj }));
}

wss.on('connection', (ws) => {
  const id = crypto.randomUUID();
  send(ws, { type: 'hello', id, permissionMode, model: model || 'claude default', root: ROOT });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return send(ws, { type: 'error', error: 'Invalid JSON' }); }

    if (msg.type === 'stop') {
      const proc = running.get(id);
      if (proc) {
        proc.kill('SIGTERM');
        running.delete(id);
        send(ws, { type: 'stopped' });
      }
      return;
    }

    if (msg.type !== 'prompt') return;

    const existing = running.get(id);
    if (existing) existing.kill('SIGTERM');

    const prompt = jarvisPrompt(msg.text || '', msg.options || {});
    const payload = { prompt, maxTurns: msg.maxTurns };
    const args = buildClaudeArgs(payload);
    send(ws, { type: 'status', status: 'thinking', command: `claude ${args.map(a => a.includes(' ') ? JSON.stringify(a) : a).join(' ')}` });

    const proc = spawn('claude', args, { cwd: ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    running.set(id, proc);

    let finalText = '';
    let stderr = '';
    let buffer = '';

    proc.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' || event.type === 'message') {
            const parts = event.message?.content || event.content || [];
            for (const part of parts) {
              if (part.type === 'text' && part.text) {
                finalText += part.text;
                send(ws, { type: 'token', text: part.text });
              }
              if (part.type === 'tool_use') send(ws, { type: 'tool', name: part.name, input: part.input });
            }
          } else if (event.type === 'stream_event') {
            const delta = event.event?.delta;
            if (delta?.type === 'text_delta' && delta.text) {
              finalText += delta.text;
              send(ws, { type: 'token', text: delta.text });
            }
            if (event.event?.type) send(ws, { type: 'trace', event: event.event.type });
          } else if (event.type === 'result') {
            if (event.result && !finalText.includes(event.result)) finalText += event.result;
            send(ws, { type: 'resultMeta', meta: { subtype: event.subtype, cost: event.total_cost_usd, turns: event.num_turns, duration: event.duration_ms, session: event.session_id } });
          } else {
            send(ws, { type: 'trace', event: event.type, raw: event });
          }
        } catch {
          finalText += line + '\n';
          send(ws, { type: 'token', text: line + '\n' });
        }
      }
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      send(ws, { type: 'stderr', text: chunk.toString() });
    });

    proc.on('close', async (code) => {
      running.delete(id);
      send(ws, { type: 'status', status: code === 0 ? 'speaking' : 'error' });
      if (msg.options?.selfCorrection && code === 0 && finalText.trim()) {
        send(ws, { type: 'trace', event: 'self-correction queued' });
      }
      send(ws, { type: 'done', code, text: finalText.trim(), stderr: stderr.trim() });
    });
  });

  ws.on('close', () => {
    const proc = running.get(id);
    if (proc) proc.kill('SIGTERM');
    running.delete(id);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Jarvis server listening on http://127.0.0.1:${PORT}`);
  console.log(`Permission mode: ${permissionMode}`);
});
