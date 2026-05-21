import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import os from 'os';
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
