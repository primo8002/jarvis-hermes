#!/usr/bin/env node
import { ensureSkillLibrary, listSkills, runSkill } from '../server/skills.js';

const root = process.cwd();
const [cmd, name, sep, ...rest] = process.argv.slice(2);

async function main() {
  await ensureSkillLibrary({ root });
  if (!cmd || cmd === 'help') {
    console.log('Usage: jarvis skills | jarvis run <skill> -- <args> | jarvis ensure-skills');
    return;
  }
  if (cmd === 'ensure-skills') {
    console.log('Skill library ready under ./skills');
    return;
  }
  if (cmd === 'skills') {
    const skills = await listSkills({ root });
    for (const s of skills) console.log(`${s.tier}\t${s.status}\t${s.name}\t${s.description}`);
    return;
  }
  if (cmd === 'run') {
    if (!name) throw new Error('Missing skill name');
    const args = (sep === '--' ? rest : [sep, ...rest]).filter(Boolean);
    const result = await runSkill(name, { args, root });
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch(error => {
  console.error(error?.message || String(error));
  process.exit(1);
});
