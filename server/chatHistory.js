import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const DEFAULT_CHAT_FILE = path.join(os.homedir(), '.jarvis', 'memory', 'chat-history.jsonl');
const VALID_ROLES = new Set(['you', 'jarvis']);
const MAX_MESSAGE_CHARS = 80_000;

function chatFile(file) {
  return file || process.env.JARVIS_CHAT_HISTORY_FILE || DEFAULT_CHAT_FILE;
}

function normalizeMessage(message = {}) {
  const role = String(message.role || '').trim();
  const text = String(message.text || '').slice(0, MAX_MESSAGE_CHARS);
  if (!VALID_ROLES.has(role) || !text.trim()) return null;
  return {
    id: message.id || `chat_${Date.now()}_${crypto.randomUUID()}`,
    at: message.at || new Date().toISOString(),
    role,
    text
  };
}

export async function appendChatMessage(message, { file } = {}) {
  const normalized = normalizeMessage(message);
  if (!normalized) return { ok: false, skipped: true, reason: 'invalid-message' };
  const target = chatFile(file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.appendFile(target, JSON.stringify(normalized) + '\n');
  return { ok: true, message: normalized, file: target };
}

export async function loadChatHistory({ file, limit = 200 } = {}) {
  const target = chatFile(file);
  let raw = '';
  try { raw = await fs.readFile(target, 'utf8'); } catch { return []; }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const row = normalizeMessage(JSON.parse(line));
      if (row) out.push(row);
    } catch {}
  }
  return out.slice(-Number(limit || 200));
}

export async function clearChatHistory({ file } = {}) {
  const target = chatFile(file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, '');
  return { ok: true, file: target };
}

export function chatHistoryPath() {
  return chatFile();
}
