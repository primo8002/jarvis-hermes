import os from 'os';
import path from 'path';
import { parseClaudeUsageWebText } from './usageLimits.js';

const CLAUDE_USAGE_URL = 'https://claude.ai/settings/usage';
const WEB_USAGE_CACHE_MS = Number(process.env.JARVIS_CLAUDE_USAGE_WEB_CACHE_MS || 60_000);
const DEFAULT_PROFILE_DIR = path.join(os.homedir(), '.jarvis', 'claude-usage-browser');
const DEFAULT_BRAVE = '/usr/bin/brave-browser';
let webUsageCache = { at: 0, data: null };
let loginWindowOpenedAt = 0;

function executablePath() {
  return process.env.JARVIS_CLAUDE_USAGE_BROWSER || process.env.BROWSER || DEFAULT_BRAVE;
}

function userDataDir() {
  return process.env.JARVIS_CLAUDE_USAGE_BROWSER_PROFILE || DEFAULT_PROFILE_DIR;
}

function headlessMode() {
  return process.env.JARVIS_CLAUDE_USAGE_HEADLESS !== 'false' ? 'new' : false;
}

async function openLoginWindow() {
  if (Date.now() - loginWindowOpenedAt < 5 * 60_000) return;
  loginWindowOpenedAt = Date.now();
  const { spawn } = await import('child_process');
  const child = spawn(executablePath(), [
    `--user-data-dir=${userDataDir()}`,
    '--no-first-run',
    '--no-default-browser-check',
    CLAUDE_USAGE_URL
  ], { detached: true, stdio: 'ignore', env: process.env });
  child.unref();
}

export function clearClaudeWebUsageCache() {
  webUsageCache = { at: 0, data: null };
}

export async function fetchClaudeWebUsage({ force = false, openLogin = false } = {}) {
  if (!force && webUsageCache.data && Date.now() - webUsageCache.at < WEB_USAGE_CACHE_MS) return webUsageCache.data;

  let browser;
  try {
    const { default: puppeteer } = await import('puppeteer-core');
    browser = await puppeteer.launch({
      executablePath: executablePath(),
      userDataDir: userDataDir(),
      headless: headlessMode(),
      args: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-features=Translate'
      ]
    });
    const page = await browser.newPage();
    await page.goto(CLAUDE_USAGE_URL, { waitUntil: 'networkidle2', timeout: 45_000 });
    await page.waitForFunction(() => document.body && document.body.innerText.length > 40, { timeout: 15_000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 2500));
    const text = await page.evaluate(() => document.body?.innerText || '');
    const parsed = parseClaudeUsageWebText(text);
    const loginRequired = /continue with google|continue with email|continue with sso|log in|sign in/i.test(text) && !/weekly usage|session usage|weekly limit|5[-\s]?hour limit/i.test(text);
    const data = {
      ...parsed,
      ok: parsed.ok && !loginRequired,
      url: CLAUDE_USAGE_URL,
      fetchedAt: new Date().toISOString(),
      loginRequired,
      browserProfile: userDataDir(),
      error: parsed.ok || loginRequired ? null : 'No usage percentages found on claude.ai/settings/usage'
    };
    if (loginRequired && openLogin) await openLoginWindow();
    webUsageCache = { at: Date.now(), data };
    return data;
  } catch (error) {
    const message = String(error?.message || error);
    const data = {
      ok: false,
      source: 'claude-ai-settings-usage',
      url: CLAUDE_USAGE_URL,
      fetchedAt: new Date().toISOString(),
      loginRequired: /browser is already running|SingletonLock|userDataDir/i.test(message),
      browserProfile: userDataDir(),
      error: message
    };
    webUsageCache = { at: Date.now(), data };
    return data;
  } finally {
    await browser?.close?.().catch(() => {});
  }
}
