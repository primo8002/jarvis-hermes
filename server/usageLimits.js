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

function normalizeUsageText(text = '') {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function percentAfterLabel(text, labels) {
  const raw = normalizeUsageText(text);
  for (const label of labels) {
    const pattern = new RegExp(`${label}[\\s\\S]{0,220}?(\\d+(?:\\.\\d+)?)\\s*%`, 'i');
    const match = raw.match(pattern);
    if (match) return clampPercent(Number(match[1]));
  }
  return null;
}

export function parseUsagePercentages(text = '') {
  return {
    fiveHourPercent: percentAfterLabel(text, ['(?:5|five)[-\\s]?hour', 'session usage', 'session limit', 'usage session']),
    weeklyPercent: percentAfterLabel(text, ['weekly usage', 'weekly limit', '\\bweek\\b', '7[-\\s]?day'])
  };
}

export function parseClaudeUsageWebText(text = '') {
  const raw = normalizeUsageText(text);
  const parsed = parseUsagePercentages(raw);
  const allPercents = [...raw.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map(m => clampPercent(Number(m[1]))).filter(v => v != null);

  let fiveHourPercent = parsed.fiveHourPercent;
  let weeklyPercent = parsed.weeklyPercent;

  if (fiveHourPercent == null && weeklyPercent == null && allPercents.length >= 2) {
    fiveHourPercent = allPercents[0];
    weeklyPercent = allPercents[1];
  } else if (weeklyPercent == null && allPercents.length === 1 && /week|weekly/i.test(raw)) {
    weeklyPercent = allPercents[0];
  }

  return {
    ok: fiveHourPercent != null || weeklyPercent != null,
    source: 'claude-ai-settings-usage',
    fiveHourPercent,
    weeklyPercent,
    text: raw.slice(0, 2000)
  };
}

export function buildLimitStatus({ fiveHour, week, cliText, webUsage, fiveHourLimitTokens, weeklyLimitTokens }) {
  const parsed = parseUsagePercentages(cliText);
  const fiveHourTokens = Number(fiveHour?.total || 0);
  const weeklyTokens = Number(week?.total || 0);
  const estimatedFiveHourPercent = percentUsed(fiveHourTokens, fiveHourLimitTokens);
  const estimatedWeeklyPercent = percentUsed(weeklyTokens, weeklyLimitTokens);
  const webFiveHour = webUsage?.fiveHourPercent ?? null;
  const webWeekly = webUsage?.weeklyPercent ?? null;
  const needsClaudeWebLogin = webUsage && !webUsage.ok && webUsage.loginRequired;

  return {
    fiveHour: {
      label: '5-hour rolling window',
      tokens: fiveHourTokens,
      limitTokens: Number(fiveHourLimitTokens || 0),
      percent: needsClaudeWebLogin ? null : (webFiveHour ?? parsed.fiveHourPercent ?? estimatedFiveHourPercent),
      source: needsClaudeWebLogin ? 'claude-ai-login-needed' : (webFiveHour != null ? 'claude-ai-settings-usage' : (parsed.fiveHourPercent == null ? 'estimated-token-budget' : 'claude-usage-text'))
    },
    weekly: {
      label: 'weekly rolling window',
      tokens: weeklyTokens,
      limitTokens: Number(weeklyLimitTokens || 0),
      percent: needsClaudeWebLogin ? null : (webWeekly ?? parsed.weeklyPercent ?? estimatedWeeklyPercent),
      source: needsClaudeWebLogin ? 'claude-ai-login-needed' : (webWeekly != null ? 'claude-ai-settings-usage' : (parsed.weeklyPercent == null ? 'estimated-token-budget' : 'claude-usage-text'))
    },
    note: webUsage?.ok
      ? 'Limit percentages are pulled directly from https://claude.ai/settings/usage; local token telemetry remains for totals/cost charts.'
      : needsClaudeWebLogin
        ? 'Login needed for direct claude.ai usage percentages. Click Refresh Claude.ai usage, sign in once in the Jarvis browser profile, then refresh again.'
        : 'Claude.ai usage page was unavailable or did not expose percentages, so percentages fall back to claude /usage text or estimated token budgets.'
  };
}
