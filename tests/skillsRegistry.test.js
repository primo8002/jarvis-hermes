import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { listSkills, getSkill, runSkill, parseSkillMarkdown, REQUIRED_SKILLS } from '../server/skills.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const sample = `---\nname: browser-operator\ndescription: Visible browser automation\ntier: C\nstatus: native\nallowed-tools:\n  - browser\ncompatibility:\n  - jarvis\n---\n# Browser Operator\n\nBody`;
const parsed = parseSkillMarkdown(sample, '/tmp/SKILL.md');
assert.equal(parsed.name, 'browser-operator');
assert.equal(parsed.description, 'Visible browser automation');
assert.deepEqual(parsed.allowedTools, ['browser']);
assert.ok(parsed.compatibility.includes('jarvis'));

const skills = await listSkills({ root });
assert.ok(skills.length >= REQUIRED_SKILLS.length, `expected at least ${REQUIRED_SKILLS.length} skills, got ${skills.length}`);
for (const name of REQUIRED_SKILLS) {
  const skill = skills.find(s => s.name === name);
  assert.ok(skill, `missing skill ${name}`);
  assert.ok(skill.path.endsWith(`skills/${name}/SKILL.md`), `bad path for ${name}: ${skill.path}`);
  const md = await fs.readFile(skill.path, 'utf8');
  assert.match(md, /^---\n[\s\S]*\n---\n/m, `${name} missing YAML frontmatter`);
  assert.match(md, /allowed-tools:/, `${name} missing allowed-tools`);
  assert.match(md, /compatibility:/, `${name} missing compatibility`);
}

const browser = await getSkill('browser-operator', { root });
assert.equal(browser.status, 'native');
assert.match(browser.body, /Cowork/i);

const adaptive = await runSkill('adaptive-tone', { args: ['debug this failing test'], root });
assert.equal(adaptive.ok, true);
assert.match(adaptive.summary, /surgical/i);

const memory = await runSkill('persistent-memory', { args: ['demo'], root });
assert.equal(memory.ok, true);
assert.ok(memory.memoryDir.includes('.jarvis'));

const missing = await runSkill('not-a-skill', { args: [], root });
assert.equal(missing.ok, false);
assert.match(missing.error, /Unknown skill/);

console.log('skills registry tests passed');
