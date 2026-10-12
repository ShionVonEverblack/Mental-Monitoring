/**
 * Adversarial Challenger Suite for Phase 6 Milestone 1
 * Target: .agents/rules/agent_skill_guardrails.md
 * 
 * Verifies:
 * 1. Strict YAML frontmatter parsing, delimiter positioning, UTF-8/BOM, key invariants, prohibited keys
 * 2. Line count (<400 lines, <=300 lines threshold) and token density (<30K tokens)
 * 3. Markdown section integrity: All 5 core architectural pillars + Section 6 code invariants
 * 4. Micro-invariants: Cyrillic/homoglyphs, whitespace integrity, trailing delimiters
 */

const fs = require('fs');
const path = require('path');

const TARGET_PATH = path.resolve(process.cwd(), '.agents/rules/agent_skill_guardrails.md');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    const errMsg = `  [FAIL] ${testName} - ${details}`;
    console.error(errMsg);
    failures.push({ testName, details });
  }
}

console.log('======================================================================');
console.log('ADVERSARIAL STRESS TEST: .agents/rules/agent_skill_guardrails.md');
console.log('======================================================================\n');

// Read raw file buffer and string
const rawBuffer = fs.readFileSync(TARGET_PATH);
const rawContent = rawBuffer.toString('utf8');

// -----------------------------------------------------------------------------
// SUITE 1: STRICT YAML FRONTMATTER & SYNTAX PARSING
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: Strict YAML Frontmatter Parsing & Delimiter Invariants ---');

// 1.1 BOM Check
const hasBOM = rawBuffer[0] === 0xef && rawBuffer[1] === 0xbb && rawBuffer[2] === 0xbf;
assert(!hasBOM, '1.1 UTF-8 without BOM', 'File contains UTF-8 BOM bytes at start');

// 1.2 Opening Delimiter
const startsWithDelim = rawContent.startsWith('---\n') || rawContent.startsWith('---\r\n');
assert(startsWithDelim, '1.2 Starts at Line 1, Col 1 with "---"', 'Missing or offset opening delimiter');

// 1.3 Frontmatter boundary extraction
const delimiterMatches = [...rawContent.matchAll(/^---[ \t]*$/gm)];
assert(delimiterMatches.length >= 2, '1.3 Exactly paired YAML delimiters exist', `Found ${delimiterMatches.length} matching "---" lines`);

const firstDelimEnd = delimiterMatches[0].index + delimiterMatches[0][0].length;
const secondDelimStart = delimiterMatches[1].index;
const frontmatterRaw = rawContent.slice(firstDelimEnd, secondDelimStart).trim();

assert(frontmatterRaw.length > 0, '1.4 Frontmatter content is non-empty', 'Frontmatter body is empty');

// 1.5 Strict Frontmatter Key Parsing (simulating strict YAML parser)
const fmLines = frontmatterRaw.split(/\r?\n/);
const fmKeys = {};
let duplicateKeyFound = false;

for (const line of fmLines) {
  const match = line.match(/^([a-zA-Z0-9_-]+):(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (fmKeys[key] !== undefined) {
      duplicateKeyFound = true;
    }
    fmKeys[key] = val;
  }
}

assert(!duplicateKeyFound, '1.5 No duplicate keys in frontmatter', 'Duplicate frontmatter key detected');
assert(fmKeys['trigger'] === 'always_on', '1.6 Valid trigger: "always_on"', `trigger is "${fmKeys['trigger']}"`);
assert(typeof fmKeys['description'] === 'string' && fmKeys['description'].length > 10, '1.7 Valid non-empty description', `description length: ${fmKeys['description'] ? fmKeys['description'].length : 0}`);
assert(fmKeys['name'] === undefined, '1.8 Prohibited key "name" is absent in system rule', `Rule improperly declared name: "${fmKeys['name']}"`);

// 1.9 YAML parse test with standard js parser simulation
try {
  // Verify strict key-value formatting
  const allowedKeys = ['trigger', 'description', 'globs'];
  const extraKeys = Object.keys(fmKeys).filter(k => !allowedKeys.includes(k));
  assert(extraKeys.length === 0, '1.9 No unexpected rogue keys in frontmatter', `Extra keys: ${extraKeys.join(', ')}`);
} catch (e) {
  assert(false, '1.9 YAML parse test', e.message);
}

// -----------------------------------------------------------------------------
// SUITE 2: LINE COUNT, BYTE SIZE, AND TOKEN DENSITY CONSTRAINTS
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Line Count and Token Economics Constraints ---');

const lines = rawContent.split(/\r?\n/);
const totalLines = lines.length;
const totalBytes = rawBuffer.length;
const totalChars = rawContent.length;
const totalWords = rawContent.split(/\s+/).filter(Boolean).length;
// BPE token heuristic: ~4 characters per token in English/technical prose
const estimatedTokens = Math.ceil(totalChars / 4);

console.log(`  Metrics Measured:`);
console.log(`    Total lines:        ${totalLines}`);
console.log(`    Total bytes:        ${totalBytes} bytes (${(totalBytes / 1024).toFixed(2)} KiB)`);
console.log(`    Total characters:   ${totalChars}`);
console.log(`    Total words:        ${totalWords}`);
console.log(`    Estimated tokens:   ~${estimatedTokens} tokens`);

assert(totalLines < 400, '2.1 Upper ceiling check: Total lines < 400 lines', `Line count is ${totalLines}`);
assert(totalLines <= 300, '2.2 Strict budget check: Total lines <= 300 lines', `Line count is ${totalLines}`);
assert(estimatedTokens < 30000, '2.3 Active context budget: Estimated tokens < 30,000', `Tokens: ${estimatedTokens}`);
assert(estimatedTokens < 5000, '2.4 Lean documentation: Estimated tokens < 5,000', `Tokens: ${estimatedTokens}`);

// -----------------------------------------------------------------------------
// SUITE 3: INTEGRITY OF MARKDOWN SECTIONS (5 PILLARS + CODE INVARIANTS)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Markdown Sectional Integrity & Architectural Pillars ---');

// Pillar 1: YAML Frontmatter Standards
const hasPillar1 = /## 1\.\s+YAML Frontmatter Standards/i.test(rawContent);
assert(hasPillar1, '3.1 Pillar 1 Section Heading: YAML Frontmatter Standards');
assert(rawContent.includes('agentskills.io'), '3.1.1 References agentskills.io standard');
assert(rawContent.includes('Google Antigravity'), '3.1.2 References Google Antigravity standard');
assert(rawContent.includes('trigger: always_on'), '3.1.3 Explains trigger: always_on');
assert(rawContent.includes('^[a-z0-9-]+$'), '3.1.4 Enforces lowercase kebab-case regex');

// Pillar 2: Context Density Compression
const hasPillar2 = /## 2\.\s+Context Density Compression/i.test(rawContent);
assert(hasPillar2, '3.2 Pillar 2 Section Heading: Context Density Compression');
assert(rawContent.includes('< 30,000 tokens') || rawContent.includes('<30K token budget'), '3.2.1 Enforces <30K token context limit');
assert(rawContent.includes('< 400 lines') || rawContent.includes('<400 lines per file'), '3.2.2 Enforces <400 lines per file');
assert(rawContent.includes('Progressive Disclosure'), '3.2.3 Enforces Progressive Disclosure Pattern');
assert(rawContent.includes('references/') && rawContent.includes('scripts/'), '3.2.4 Directs heavy data to references/ and scripts/');

// Pillar 3: Offline-First Data Integrity & Zero Runtime Telemetry
const hasPillar3 = /## 3\.\s+Offline-First Data Integrity & Zero Runtime Telemetry/i.test(rawContent);
assert(hasPillar3, '3.3 Pillar 3 Section Heading: Offline-First Data Integrity');
assert(rawContent.includes('Yale Mood Meter 2D'), '3.3.1 Invariant: Yale Mood Meter 2D on-device circumplex');
assert(rawContent.includes('JITAI') && rawContent.includes('14,400,000 ms'), '3.3.2 Invariant: JITAI 4-hour cooldown (14,400,000 ms)');
assert(rawContent.includes('CBT-I') && rawContent.includes('Sleep Efficiency'), '3.3.3 Invariant: CBT-I on-device sleep efficiency');
assert(rawContent.includes('Web Audio') && (rawContent.includes('0 KB external audio') || rawContent.includes('0 KB')), '3.3.4 Invariant: Web Audio 0 KB asset download');
assert(rawContent.includes('sendBeacon') && rawContent.includes('Google Analytics'), '3.3.5 Invariant: Zero tracking SDKs & sendBeacon prohibition');
assert(rawContent.includes('isNetworkAllowed'), '3.3.6 Invariant: isNetworkAllowed() gatekeeping');
assert(rawContent.includes('maximumFileSizeToCacheInBytes: 3000000'), '3.3.7 Invariant: Workbox 3MB precache headroom');

// Pillar 4: Statutory Privacy Compliance (Indonesian UU PDP No. 27/2022)
const hasPillar4 = /## 4\.\s+Statutory Privacy Compliance/i.test(rawContent);
assert(hasPillar4, '3.4 Pillar 4 Section Heading: Statutory Privacy Compliance');
assert(rawContent.includes('UU PDP No. 27/2022') || rawContent.includes('Nomor 27 Tahun 2022'), '3.4.1 Cites UU PDP No. 27/2022');
assert(rawContent.includes('Data Pribadi Spesifik'), '3.4.2 Cites Specific Personal Data (Data Pribadi Spesifik) Pasal 4 & 16');
assert(rawContent.includes('ConsentModal') && rawContent.includes('rima-consent-accepted'), '3.4.3 Cites explicit consent invariants');
assert(rawContent.includes('wipeAllUserData'), '3.4.4 Cites Hak Penghapusan / 1-tap complete erasure');
assert(rawContent.includes('generateAnonymousName') && rawContent.includes('Calm River'), '3.4.5 Cites Anonymous Guest Mode pseudonymization');
assert(rawContent.includes('differential privacy') || rawContent.includes('epsilon <= 1.0') || rawContent.includes('\\epsilon \\le 1.0'), '3.4.6 Cites differential privacy epsilon <= 1.0');
assert(rawContent.includes('72-Hour') || rawContent.includes('72 jam') || rawContent.includes('3 x 24 jam'), '3.4.7 Cites 72-hour breach notification');

// Pillar 5: Client-Side Cryptographic Standards (Web Crypto AES-GCM-256 & PBKDF2)
const hasPillar5 = /## 5\.\s+Client-Side Cryptographic Standards/i.test(rawContent);
assert(hasPillar5, '3.5 Pillar 5 Section Heading: Client-Side Cryptography');
assert(rawContent.includes('AES-GCM-256'), '3.5.1 Cites AES-GCM-256');
assert(rawContent.includes('96-bit IV') || rawContent.includes('12 bytes'), '3.5.2 Cites 96-bit IV (12 bytes)');
assert(rawContent.includes('600,000 iterations') || rawContent.includes('600k iterations'), '3.5.3 Cites PBKDF2 600,000 iterations (OWASP)');
assert(rawContent.includes('extractable: false'), '3.5.4 Invariant: Non-extractable volatile keys');
assert(rawContent.includes('interface EncryptedPayload') && rawContent.includes('version: 1'), '3.5.5 Invariant: EncryptedPayload schema version: 1');
assert(rawContent.includes('isEncryptedPayload'), '3.5.6 Invariant: isEncryptedPayload type guard');
assert(rawContent.includes('tidak dapat didekripsi'), '3.5.7 Invariant: Graceful decryption failure fallback string');

// Section 6: Architectural Invariants & Preservation of 4 Quality Gates
const hasSection6 = /## 6\.\s+Architectural Invariants & Preservation of 4 Quality Gates/i.test(rawContent);
assert(hasSection6, '3.6 Section 6 Section Heading: Architectural Invariants & Quality Gates');
assert(rawContent.includes('Zero Tailwind CSS') || rawContent.includes('zero Tailwind'), '3.6.1 Strictly Zero Tailwind CSS');
assert(rawContent.includes('src/styles/design-tokens.css'), '3.6.2 Pure Vanilla CSS Design Tokens');
assert(rawContent.includes('WCAG 2.2 AA') && (rawContent.includes('48px') || rawContent.includes('48\\text{px}')), '3.6.3 WCAG 2.2 AA touch targets & sensory modes');
assert(rawContent.includes('100% 8-language i18n parity') || rawContent.includes('8-language'), '3.6.4 100% 8-language i18n parity with RTL');
assert(rawContent.includes('npm run lint') && rawContent.includes('npx tsc -b') && rawContent.includes('npm test') && rawContent.includes('npm run build'), '3.6.5 The 4 Mandatory Repository Quality Gates commands');

// -----------------------------------------------------------------------------
// SUITE 4: ADVERSARIAL EDGE CASE SCANNING
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Adversarial Edge Cases, Homoglyphs & Trailing Syntax ---');

// 4.1 Check for accidental hidden non-ASCII characters in frontmatter
const nonAsciiInFm = [...frontmatterRaw].filter(c => c.charCodeAt(0) > 127);
assert(nonAsciiInFm.length === 0, '4.1 Pure ASCII in YAML frontmatter', `Found non-ASCII: ${nonAsciiInFm.join('')}`);

// 4.2 Check that file ends cleanly (not truncated mid-sentence or mid-code block)
const trimmed = rawContent.trim();
const hasCleanEnd = trimmed.endsWith('qualifies as completed work.') || trimmed.endsWith('```') || trimmed.endsWith('---');
assert(hasCleanEnd, '4.2 Clean uncorrupted termination of markdown document');

// 4.3 Check that code blocks have matching opening and closing fences
const codeFences = (rawContent.match(/```/g) || []).length;
assert(codeFences % 2 === 0, '4.3 Perfectly paired markdown code fences (```)', `Found odd number of fences: ${codeFences}`);

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('======================================================================');

if (failedTests === 0) {
  console.log('\nVERDICT: EMPIRICAL APPROVAL CONFIRMED (APPROVE)');
  process.exit(0);
} else {
  console.error('\nVERDICT: CHALLENGE REJECTION (REJECT)');
  process.exit(1);
}
