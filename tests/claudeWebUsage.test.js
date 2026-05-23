import assert from 'node:assert/strict';
import { clearClaudeWebUsageCache, openClaudeUsageWindow } from '../server/claudeWebUsage.js';

process.env.JARVIS_CLAUDE_USAGE_OPENER = '/bin/true';
process.env.JARVIS_CLAUDE_USAGE_BROWSER = '/bin/true';
process.env.JARVIS_CLAUDE_USAGE_BROWSER_PROFILE = '/tmp/jarvis-test-profile';

clearClaudeWebUsageCache();
const first = await openClaudeUsageWindow({ force: true });
assert.equal(first.ok, true);
assert.equal(first.command, '/bin/true');
assert.deepEqual(first.args, ['https://claude.ai/settings/usage']);
assert.equal(first.browserProfile, 'default-browser');
assert.equal(typeof first.pid, 'number');

const isolated = await openClaudeUsageWindow({ force: true, isolatedProfile: true });
assert.equal(isolated.command, '/bin/true');
assert.ok(isolated.args.includes('--user-data-dir=/tmp/jarvis-test-profile'));
assert.ok(isolated.args.includes('https://claude.ai/settings/usage'));

const second = await openClaudeUsageWindow({ force: false });
assert.equal(second.ok, true);
assert.equal(second.skipped, true);

console.log('claude web usage tests passed');
