import assert from 'node:assert/strict';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { appendChatMessage, clearChatHistory, loadChatHistory } from '../server/chatHistory.js';

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'jarvis-chat-history-'));
const file = path.join(dir, 'chat.jsonl');

assert.deepEqual(await loadChatHistory({ file }), []);

await appendChatMessage({ role: 'you', text: 'Remember this after refresh' }, { file });
await appendChatMessage({ role: 'jarvis', text: 'I will persist this chat.' }, { file });
let history = await loadChatHistory({ file });
assert.equal(history.length, 2);
assert.equal(history[0].role, 'you');
assert.equal(history[0].text, 'Remember this after refresh');
assert.match(history[0].id, /^chat_/);
assert.ok(history[0].at);
assert.equal(history[1].role, 'jarvis');

await appendChatMessage({ role: 'tool', text: 'ignored role' }, { file });
history = await loadChatHistory({ file });
assert.equal(history.length, 2, 'invalid roles should be ignored');

await clearChatHistory({ file });
assert.deepEqual(await loadChatHistory({ file }), []);

console.log('chat history tests passed');
