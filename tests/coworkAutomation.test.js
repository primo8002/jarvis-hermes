import assert from 'node:assert/strict';
import { buildCoworkResearchSummary, detectResearchUrl, normalizeResearchUrl, sanitizeResearchQuery } from '../server/coworkAutomation.js';

assert.equal(normalizeResearchUrl('example.com'), 'https://example.com');
assert.equal(normalizeResearchUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
assert.equal(detectResearchUrl('go to anthropic.com and research Claude'), 'https://anthropic.com');
assert.equal(detectResearchUrl('Research https://example.com/pricing for me'), 'https://example.com/pricing');
assert.equal(detectResearchUrl('just research AI assistants'), null);
assert.equal(sanitizeResearchQuery('  learn   everything about pricing \n and competitors '), 'learn everything about pricing and competitors');

const summary = buildCoworkResearchSummary({
  url: 'https://example.com',
  title: 'Example Domain',
  query: 'research it',
  sections: [
    { scrollY: 0, headings: ['Hero'], text: 'Example Domain This domain is for use in illustrative examples.' },
    { scrollY: 600, headings: ['More'], text: 'More content about examples and documentation.' }
  ],
  links: [
    { text: 'More information', href: 'https://iana.org/domains/example' },
    { text: '', href: 'https://ignored.example' }
  ]
});
assert.match(summary, /Visible Cowork research complete/);
assert.match(summary, /Example Domain/);
assert.match(summary, /More information/);
assert.ok(summary.length < 5000);

console.log('cowork automation tests passed');
