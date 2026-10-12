const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('VICTORY AUDITOR: INDEPENDENT COMPREHENSIVE VERIFICATION SUITE');
console.log('================================================================');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SKILLS_DIR = path.join(PROJECT_ROOT, '.agents', 'skills');
const RULES_DIR = path.join(PROJECT_ROOT, '.agents', 'rules');

const targetSkills = [
  { dir: 'librechat', maxLines: 400, expectedName: 'librechat' },
  { dir: 'awesome-agent-skills', maxLines: 150, expectedName: 'awesome-agent-skills' },
  { dir: 'anthropic-cybersecurity-skills', maxLines: 400, expectedName: 'anthropic-cybersecurity-skills' },
  { dir: 'aion-ui', maxLines: 400, expectedName: 'aion-ui' },
  { dir: 'claude-skills', maxLines: 400, expectedName: 'claude-skills' },
  { dir: 'ai-guide', maxLines: 400, expectedName: 'ai-guide' },
  { dir: 'generic-agent', maxLines: 400, expectedName: 'generic-agent' }
];

let checksTotal = 0;
let checksPassed = 0;
let failures = [];

function check(desc, condition, detail = '') {
  checksTotal++;
  if (condition) {
    checksPassed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    console.error(`  [FAIL] ${desc} :: ${detail}`);
    failures.push(`${desc}: ${detail}`);
  }
}

// -------------------------------------------------------------
// CHECK 1: Target Skill Libraries
// -------------------------------------------------------------
console.log('\n--- 1. Verification of 7 Target Skill Libraries ---');

for (const skill of targetSkills) {
  const skillPath = path.join(SKILLS_DIR, skill.dir, 'SKILL.md');
  const exists = fs.existsSync(skillPath);
  check(`File exists: .agents/skills/${skill.dir}/SKILL.md`, exists);
  if (!exists) continue;

  const raw = fs.readFileSync(skillPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const lineCount = lines.length;

  check(`${skill.dir}: Line count <= ${skill.maxLines} (actual: ${lineCount})`, lineCount <= skill.maxLines);
  check(`${skill.dir}: Starts with '---'`, raw.startsWith('---\n') || raw.startsWith('---\r\n'));

  const parts = raw.split(/^---[ \t]*$/m);
  check(`${skill.dir}: Paired frontmatter delimiters`, parts.length >= 3);

  const frontmatter = parts[1] || '';
  check(`${skill.dir}: Frontmatter contains name matching dir`, new RegExp(`name:\\s*${skill.expectedName}`).test(frontmatter));
  check(`${skill.dir}: Frontmatter contains valid description`, /description:\s*.+/s.test(frontmatter));
  check(`${skill.dir}: Does NOT contain prohibited trigger: always_on`, !/trigger:\s*always_on/.test(frontmatter));

  // Content substance checks
  check(`${skill.dir}: Has substantial content (> 2000 bytes)`, raw.length > 2000, `Bytes: ${raw.length}`);
  check(`${skill.dir}: Contains standard sections and runbook`, raw.includes('## ') && raw.includes('```'));
}

// -------------------------------------------------------------
// CHECK 2: awesome-agent-skills Modular References
// -------------------------------------------------------------
console.log('\n--- 2. Verification of awesome-agent-skills Modular References ---');

const awesomeRefs = [
  'cross_harness_adapters.md',
  'curated_playbooks_catalog.md',
  'legacy_translation_guide.md'
];

for (const ref of awesomeRefs) {
  const refPath = path.join(SKILLS_DIR, 'awesome-agent-skills', 'references', ref);
  const exists = fs.existsSync(refPath);
  check(`Reference exists: ${ref}`, exists);
  if (exists) {
    const raw = fs.readFileSync(refPath, 'utf8');
    const lineCount = raw.split(/\r?\n/).length;
    check(`${ref}: Line count <= 400 (actual: ${lineCount})`, lineCount <= 400);
    check(`${ref}: Substantive markdown content`, raw.length > 1000);
  }
}

// -------------------------------------------------------------
// CHECK 3: System Guardrail Rule (.agents/rules/agent_skill_guardrails.md)
// -------------------------------------------------------------
console.log('\n--- 3. Verification of System Guardrails Rule ---');

const rulePath = path.join(RULES_DIR, 'agent_skill_guardrails.md');
const ruleExists = fs.existsSync(rulePath);
check('File exists: .agents/rules/agent_skill_guardrails.md', ruleExists);

if (ruleExists) {
  const rawRule = fs.readFileSync(rulePath, 'utf8');
  const ruleLines = rawRule.split(/\r?\n/).length;

  check('agent_skill_guardrails.md: Starts with "---"', rawRule.startsWith('---\n') || rawRule.startsWith('---\r\n'));
  check('agent_skill_guardrails.md: Paired frontmatter delimiters', rawRule.split(/^---[ \t]*$/m).length >= 3);

  const parts = rawRule.split(/^---[ \t]*$/m);
  const ruleFm = parts[1] || '';

  check('agent_skill_guardrails.md: trigger: always_on declared', /trigger:\s*always_on/.test(ruleFm));
  check('agent_skill_guardrails.md: Description present', /description:\s*.+/.test(ruleFm));
  check('agent_skill_guardrails.md: Line count <= 400 (actual: ' + ruleLines + ')', ruleLines <= 400);

  // Content requirements
  check('Rule mandates YAML frontmatter compliance', rawRule.includes('YAML Frontmatter Standards') && rawRule.includes('agentskills.io'));
  check('Rule mandates Context density (<30K tokens, <400 lines)', rawRule.includes('< 30,000 tokens') || rawRule.includes('<30K token budget'));
  check('Rule mandates Offline-first data integrity', rawRule.includes('Offline-First Data Integrity') && rawRule.includes('Zero Runtime External Telemetry'));
  check('Rule mandates UU PDP No. 27/2022 privacy', rawRule.includes('UU PDP No. 27/2022') && rawRule.includes('Data Pribadi Spesifik'));
  check('Rule mandates Client-side Web Crypto AES-GCM-256 + PBKDF2 (600k)', rawRule.includes('AES-GCM-256') && (rawRule.includes('600,000 iterations') || rawRule.includes('600k iterations')));
  check('Rule mandates 4 Quality Gates', rawRule.includes('npm run lint') && rawRule.includes('npx tsc -b') && rawRule.includes('npm test') && rawRule.includes('npm run build'));
}

// -------------------------------------------------------------
// CHECK 4: Codebase Integrity & Write Boundaries
// -------------------------------------------------------------
console.log('\n--- 4. Codebase Integrity & Write Boundaries ---');

// Check that no src/ files were modified in working directory
const gitStatusOutput = require('child_process').execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf8' });
const modifiedLines = gitStatusOutput.split('\n').filter(Boolean);
const srcModifications = modifiedLines.filter(line => /src\//.test(line));

check('Zero modifications to src/ directory', srcModifications.length === 0, `Violations: ${srcModifications.join(', ')}`);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${checksPassed}/${checksTotal} PASSED (${failures.length} FAILED)`);
console.log('================================================================');

if (failures.length > 0) {
  console.error('FAILURES DETECTED:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
} else {
  console.log('AUDIT VERDICT: 100% SPECIFICATION CONFORMANCE CONFIRMED!');
  process.exit(0);
}
