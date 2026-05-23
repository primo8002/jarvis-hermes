export function clampPercent(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(999, value));
}

export function percentUsed(used, limit) {
  const u = Number(used || 0);
  const l = Number(limit || 0);
  if (!Number.isFinite(u) || !Number.isFinite(l) || l <= 0) return null;
  return clampPercent((u / l) * 100);
}

export function parseUsagePercentages(text = '') {
  const raw = String(text || '');
  const fiveHourMatch = raw.match(/(?:5|five)[-\s]?hour[^%\n]{0,80}?(\d+(?:\.\d+)?)\s*%/i);
  const weeklyMatch = raw.match(/(?:week|weekly|7[-\s]?day)[^%\n]{0,80}?(\d+(?:\.\d+)?)\s*%/i);
  return {
    fiveHourPercent: fiveHourMatch ? clampPercent(Number(fiveHourMatch[1])) : null,
    weeklyPercent: weeklyMatch ? clampPercent(Number(weeklyMatch[1])) : null
  };
}

export function buildLimitStatus({ fiveHour, week, cliText, fiveHourLimitTokens, weeklyLimitTokens }) {
  const parsed = parseUsagePercentages(cliText);
  const fiveHourTokens = Number(fiveHour?.total || 0);
  const weeklyTokens = Number(week?.total || 0);
  const estimatedFiveHourPercent = percentUsed(fiveHourTokens, fiveHourLimitTokens);
  const estimatedWeeklyPercent = percentUsed(weeklyTokens, weeklyLimitTokens);
  return {
    fiveHour: {
      label: '5-hour rolling window',
      tokens: fiveHourTokens,
      limitTokens: Number(fiveHourLimitTokens || 0),
      percent: parsed.fiveHourPercent ?? estimatedFiveHourPercent,
      source: parsed.fiveHourPercent == null ? 'estimated-token-budget' : 'claude-usage-text'
    },
    weekly: {
      label: 'weekly rolling window',
      tokens: weeklyTokens,
      limitTokens: Number(weeklyLimitTokens || 0),
      percent: parsed.weeklyPercent ?? estimatedWeeklyPercent,
      source: parsed.weeklyPercent == null ? 'estimated-token-budget' : 'claude-usage-text'
    },
    note: 'Claude Code does not expose exact subscription quota numbers through a stable local API, so percentages use claude /usage text when it includes percentages; otherwise they are estimates from local token telemetry and configurable token budgets.'
  };
}
