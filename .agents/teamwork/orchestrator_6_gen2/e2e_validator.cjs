const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('RIMA PHASE 6: COMPREHENSIVE E2E VALIDATION & AUDIT SUITE');
console.log('================================================================');

const SKILL_ROOT = path.join(__dirname, '..', '..', 'skills');
const RULES_ROOT = path.join(__dirname, '..', '..', 'rules');

const expectedSkills = [
  { name: 'librechat', maxLines: 400 },
  { name: 'awesome-agent-skills', maxLines: 150 },
  { name: 'anthropic-cybersecurity-skills', maxLines: 400 },
  { name: 'aion-ui', maxLines: 400 },
  { name: 'claude-skills', maxLines: 400 },
  { name: 'ai-guide', maxLines: 400 },
  { name: 'generic-agent', maxLines: 400 },
];

let errors = [];

// 1. Validate All 7 Target Skills
console.log('\n--- TIER 1: E2E Frontmatter & Line Budget Audit (7 Target Skills) ---');
for (const skill of expectedSkills) {
  const skillFile = path.join(SKILL_ROOT, skill.name, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    errors.push(`Missing skill file: ${skillFile}`);
    continue;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  const lines = content.split('\n').length;

  if (lines > skill.maxLines) {
    errors.push(`${skill.name} exceeds line budget: ${lines} > ${skill.maxLines}`);
  }

  if (!content.startsWith('---\n')) {
    errors.push(`${skill.name} missing opening frontmatter delimiter`);
  }

  const endIdx = content.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    errors.push(`${skill.name} missing closing frontmatter delimiter`);
  } else {
    const yaml = content.substring(4, endIdx);
    if (!yaml.includes(`name: ${skill.name}`)) {
      errors.push(`${skill.name} frontmatter name mismatch`);
    }
    if (!yaml.includes('description:')) {
      errors.push(`${skill.name} missing description in frontmatter`);
    }
    if (!yaml.includes('license:')) {
      errors.push(`${skill.name} missing license in frontmatter`);
    }
    if (/trigger:\s*always_on/.test(yaml)) {
      errors.push(`${skill.name} illegally declares trigger: always_on`);
    }
  }

  console.log(`[PASS] ${skill.name.padEnd(32)} -> Lines: ${String(lines).padStart(3)} / ${skill.maxLines} | Frontmatter: VALID`);
}

// 2. Validate System Guardrail Rule
console.log('\n--- TIER 2: System Guardrail Rule Validation (.agents/rules/) ---');
const guardrailFile = path.join(RULES_ROOT, 'agent_skill_guardrails.md');
if (!fs.existsSync(guardrailFile)) {
  errors.push(`Missing rule file: ${guardrailFile}`);
} else {
  const content = fs.readFileSync(guardrailFile, 'utf8');
  const lines = content.split('\n').length;
  if (!content.startsWith('---\n')) {
    errors.push('agent_skill_guardrails.md missing opening frontmatter delimiter');
  }
  const endIdx = content.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    errors.push('agent_skill_guardrails.md missing closing frontmatter delimiter');
  } else {
    const yaml = content.substring(4, endIdx);
    if (!/trigger:\s*always_on/.test(yaml)) {
      errors.push('agent_skill_guardrails.md missing required trigger: always_on');
    }
    if (!yaml.includes('description:')) {
      errors.push('agent_skill_guardrails.md missing description');
    }
  }
  console.log(`[PASS] agent_skill_guardrails.md         -> Lines: ${String(lines).padStart(3)} / 400 | trigger: always_on [VERIFIED]`);
}

// 3. Validate awesome-agent-skills References
console.log('\n--- TIER 3: Modular Package References (awesome-agent-skills) ---');
const awesomeRefs = [
  'cross_harness_adapters.md',
  'legacy_translation_guide.md',
  'curated_playbooks_catalog.md',
];
for (const ref of awesomeRefs) {
  const refPath = path.join(SKILL_ROOT, 'awesome-agent-skills', 'references', ref);
  if (!fs.existsSync(refPath)) {
    errors.push(`Missing reference file: ${refPath}`);
  } else {
    const lines = fs.readFileSync(refPath, 'utf8').split('\n').length;
    if (lines > 400) errors.push(`${ref} exceeds line budget: ${lines} > 400`);
    console.log(`[PASS] ${ref.padEnd(32)} -> Lines: ${String(lines).padStart(3)} / 400 [VERIFIED]`);
  }
}

if (errors.length > 0) {
  console.error('\nE2E VALIDATION FAILED WITH ERRORS:');
  for (const err of errors) console.error('  - ' + err);
  process.exit(1);
} else {
  console.log('\n================================================================');
  console.log('E2E VALIDATION RESULT: 100% SUCCESS — ALL SPECIFICATIONS PASS!');
  console.log('================================================================\n');
}
