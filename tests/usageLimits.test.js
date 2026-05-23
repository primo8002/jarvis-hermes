import assert from 'node:assert/strict';
import { buildLimitStatus, parseClaudeUsageWebText, parseUsagePercentages, percentUsed } from '../server/usageLimits.js';

assert.equal(percentUsed(50, 200), 25);
assert.equal(percentUsed(1, 0), null);
assert.deepEqual(parseUsagePercentages('5-hour limit: 37% used\nWeekly usage: 62% used'), {
  fiveHourPercent: 37,
  weeklyPercent: 62
});

const web = parseClaudeUsageWebText(`Claude usage
Session usage
3% used
resets at 2:00 PM
Weekly usage
30% used
resets Monday`);
assert.equal(web.fiveHourPercent, 3);
assert.equal(web.weeklyPercent, 30);
assert.equal(web.source, 'claude-ai-settings-usage');

const webAlt = parseClaudeUsageWebText(`Usage limits\n5-hour limit 11%\nweek 44%`);
assert.equal(webAlt.fiveHourPercent, 11);
assert.equal(webAlt.weeklyPercent, 44);

const status = buildLimitStatus({
  fiveHour: { total: 250 },
  week: { total: 400 },
  cliText: '',
  fiveHourLimitTokens: 1000,
  weeklyLimitTokens: 2000
});
assert.equal(status.fiveHour.percent, 25);
assert.equal(status.weekly.percent, 20);
assert.equal(status.fiveHour.source, 'estimated-token-budget');

const cliStatus = buildLimitStatus({
  fiveHour: { total: 250 },
  week: { total: 400 },
  cliText: 'Five hour usage 12.5%\nWeekly usage 55%',
  fiveHourLimitTokens: 1000,
  weeklyLimitTokens: 2000
});
assert.equal(cliStatus.fiveHour.percent, 12.5);
assert.equal(cliStatus.weekly.percent, 55);
assert.equal(cliStatus.weekly.source, 'claude-usage-text');

const webPreferredStatus = buildLimitStatus({
  fiveHour: { total: 250 },
  week: { total: 460 },
  cliText: '',
  webUsage: { fiveHourPercent: 4, weeklyPercent: 30, source: 'claude-ai-settings-usage', fetchedAt: 'now' },
  fiveHourLimitTokens: 1000,
  weeklyLimitTokens: 1000
});
assert.equal(webPreferredStatus.fiveHour.percent, 4);
assert.equal(webPreferredStatus.fiveHour.source, 'claude-ai-settings-usage');
assert.equal(webPreferredStatus.weekly.percent, 30);
assert.equal(webPreferredStatus.weekly.source, 'claude-ai-settings-usage');

const loginNeededStatus = buildLimitStatus({
  fiveHour: { total: 250 },
  week: { total: 460 },
  cliText: '',
  webUsage: { ok: false, loginRequired: true, source: 'claude-ai-settings-usage' },
  fiveHourLimitTokens: 1000,
  weeklyLimitTokens: 1000
});
assert.equal(loginNeededStatus.weekly.percent, null);
assert.equal(loginNeededStatus.weekly.source, 'claude-ai-login-needed');

console.log('usage limit tests passed');
