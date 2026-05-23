import os from 'os';
import path from 'path';

const DEFAULT_BRAVE = '/usr/bin/brave-browser';
const DEFAULT_PROFILE_DIR = path.join(os.homedir(), '.jarvis', 'cowork-browser');
const DEFAULT_VIEWPORT = { width: 1440, height: 980 };

export function normalizeResearchUrl(value) {
  const raw = String(value || '').trim().replace(/[)>.,;]+$/g, '');
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
    return url.toString().replace(/\/$/, url.pathname === '/' && !url.search && !url.hash ? '' : '/');
  } catch {
    return null;
  }
}

export function detectResearchUrl(text) {
  const input = String(text || '');
  const explicit = input.match(/https?:\/\/[^\s)>'"]+/i)?.[0];
  if (explicit) return normalizeResearchUrl(explicit);
  const domain = input.match(/\b((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/[^\s)>'"]*)?/i)?.[0];
  return domain ? normalizeResearchUrl(domain) : null;
}

export function sanitizeResearchQuery(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 500);
}

function browserExecutable() {
  return process.env.JARVIS_COWORK_BROWSER || process.env.JARVIS_CLAUDE_USAGE_BROWSER || process.env.BROWSER || DEFAULT_BRAVE;
}

function browserProfile() {
  return process.env.JARVIS_COWORK_BROWSER_PROFILE || DEFAULT_PROFILE_DIR;
}

function visibleBrowser() {
  return process.env.JARVIS_COWORK_HEADLESS === 'true' ? 'new' : false;
}

async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function trimText(text, max = 1400) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildCoworkResearchSummary({ url, title, query, sections = [], links = [] }) {
  const usefulLinks = links
    .filter(link => link?.text && link?.href)
    .slice(0, 8)
    .map(link => `- ${trimText(link.text, 80)}: ${link.href}`)
    .join('\n');
  const sectionText = sections.slice(0, 8).map((section, index) => {
    const headings = section.headings?.length ? `\n  headings: ${section.headings.slice(0, 6).join(' | ')}` : '';
    return `Scroll ${index + 1} at y=${section.scrollY || 0}:${headings}\n  ${trimText(section.text, 1000)}`;
  }).join('\n\n');
  return [
    `Visible Cowork research complete for ${url}`,
    `Title: ${title || 'unknown'}`,
    `Research focus: ${query || 'general site research'}`,
    '',
    'Observed page content while visibly scrolling:',
    sectionText || 'No readable page text captured.',
    '',
    'Useful links discovered:',
    usefulLinks || 'No labeled links found.'
  ].join('\n').slice(0, 4800);
}

export async function runVisibleCoworkResearch({ url, query = '', maxScrolls = 6, dwellMs = 900 } = {}) {
  const targetUrl = normalizeResearchUrl(url);
  if (!targetUrl) throw new Error('A valid url is required for Cowork research');

  const { default: puppeteer } = await import('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: browserExecutable(),
    userDataDir: browserProfile(),
    headless: visibleBrowser(),
    defaultViewport: null,
    args: [
      `--window-size=${DEFAULT_VIEWPORT.width},${DEFAULT_VIEWPORT.height}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-features=Translate'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT).catch(() => {});
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await pause(dwellMs);

    const sections = [];
    const steps = Math.max(1, Math.min(12, Number(maxScrolls) || 6));
    for (let i = 0; i < steps; i += 1) {
      const snapshot = await page.evaluate(() => {
        const selectors = 'main, article, section, body';
        const root = document.querySelector('main') || document.querySelector('article') || document.body;
        const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.innerText).filter(Boolean).slice(0, 12);
        return {
          scrollY: Math.round(window.scrollY),
          headings,
          text: (root?.innerText || document.body?.innerText || '').slice(0, 5000)
        };
      });
      sections.push(snapshot);
      await page.evaluate(() => window.scrollBy({ top: Math.round(window.innerHeight * 0.78), left: 0, behavior: 'smooth' }));
      await pause(dwellMs);
    }

    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: (a.innerText || a.getAttribute('aria-label') || '').trim(),
      href: a.href
    })).filter(x => x.href).slice(0, 40));
    const title = await page.title();
    const finalUrl = page.url();
    const summary = buildCoworkResearchSummary({ url: finalUrl || targetUrl, title, query: sanitizeResearchQuery(query), sections, links });
    return { ok: true, source: 'jarvis-cowork-visible-browser', url: finalUrl || targetUrl, title, query: sanitizeResearchQuery(query), sections, links, summary, browserProfile: browserProfile(), visible: visibleBrowser() === false };
  } finally {
    if (process.env.JARVIS_COWORK_KEEP_OPEN !== 'true') await browser.close().catch(() => {});
  }
}
