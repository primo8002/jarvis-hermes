import assert from 'node:assert/strict';
import { buildLimitStatus, parseUsagePercentages, percentUsed } from '../server/usageLimits.js';

assert.equal(percentUsed(50, 200), 25);
assert.equal(percentUsed(1, 0), null);
assert.deepEqual(parseUsagePercentages('5-hour limit: 37% used\nWeekly usage: 62% used'), {
  fiveHourPercent: 37,
  weeklyPercent: 62
});

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

console.log('usage limit tests passed');
