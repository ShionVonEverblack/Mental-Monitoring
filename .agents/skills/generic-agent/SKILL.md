---
name: generic-agent
description: >-
  Self-evolving skill tree crystallization mechanism, execution trace recording, and context density
  compression (<30K tokens) for RIMA agents. Use when capturing successful problem-solving trajectories,
  distilling raw execution logs into modular SOP skills, compressing large conversational contexts, or
  retrieving specialized procedural skills from the hierarchical skill tree.
license: MIT
metadata:
  category: self-evolving-agent-architecture
  upstream: https://github.com/lsdefine/GenericAgent
---

# GenericAgent: Self-Evolving Skill Tree & Context Compression Skill

This skill provides execution trace recording schemas, skill crystallization algorithms, 4-tier hierarchical memory management, and context density compression protocols derived from the GenericAgent architecture (`lsdefine/GenericAgent`).

---

## 1. Execution Trace Recording (`trace-recorder`)

### 1.1 Structural Schema of an Execution Trace
During complex problem-solving sessions, agents capture a structured telemetry trace logging every tool invocation, observation, and obstacle resolution:

```json
{
  "traceId": "trace-20261012-pwa-bundle-opt",
  "taskGoal": "Eliminate bundle bloat by partitioning i18n locales and vendor libs",
  "initialState": {
    "mainChunkBytes": 628320,
    "qualityGatesPassed": false
  },
  "steps": [
    {
      "step": 1,
      "tool": "run_command",
      "command": "npm run build",
      "observation": "Index bundle contains heavy raw JSON localization dictionary",
      "obstacle": "Main bundle size exceeded 250 kB threshold",
      "resolution": "Configure Rollup manualChunks with regex matcher /[\\\\/]src[\\\\/]i18n[\\\\/][^\\\\/]+\\.json$/"
    },
    {
      "step": 2,
      "tool": "replace_file_content",
      "target": "vite.config.ts",
      "observation": "Added chunk configuration for i18n-locales and recharts-vendor",
      "obstacle": null,
      "resolution": "Verified clean precache generation in dist/sw.js"
    }
  ],
  "finalState": {
    "mainChunkBytes": 138670,
    "qualityGatesPassed": true
  },
  "verified": true
}
```

---

## 2. Skill Tree Crystallization Mechanism (`crystallizer`)

### 2.1 The 5-Step Distillation Pipeline
Raw execution traces contain conversational noise, failed exploratory paths, and environment-specific paths. Crystallization transforms ephemeral trajectories into permanent, reusable skills:

```text
[Raw Execution Trace]
          │
          ▼ Step 1: Filter & Prune (Discard syntax typos and failed exploratory commands)
┌────────────────────────────────────────────────────────┐
│             Core Invariant Trajectory                  │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼ Step 2: Parameter Abstraction (Replace local paths with variables)
┌────────────────────────────────────────────────────────┐
│           Generalized Standard Operating Procedure      │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼ Step 3: YAML Frontmatter Authoring
┌────────────────────────────────────────────────────────┐
│           agentskills.io Metadata & Trigger Specification│
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼ Step 4: Verification Runbook Extraction
┌────────────────────────────────────────────────────────┐
│           Deterministic Exit-Code Test Commands        │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼ Step 5: Save to .agents/skills/<name>/SKILL.md
```

### 2.2 Reusable Crystallization Function (TypeScript / Node.js)
```typescript
export interface ExecutionStep {
  tool: string;
  command?: string;
  observation: string;
  resolution?: string;
}

export function crystallizeSkillDocument(
  skillName: string,
  description: string,
  steps: ExecutionStep[],
  verificationCommand: string
): string {
  const frontmatter = [
    '---',
    `name: ${skillName}`,
    'description: >-',
    `  ${description.trim()}`,
    'license: MIT',
    '---',
  ].join('\n');

  const sop = steps
    .filter((s) => s.resolution)
    .map((s, idx) => `### Step ${idx + 1}: ${s.tool}\n- **Action**: \`${s.command || s.tool}\`\n- **Rationale**: ${s.resolution}`)
    .join('\n\n');

  return `${frontmatter}\n\n# ${skillName} Runbook\n\n## Standard Operating Procedure\n\n${sop}\n\n## Verification\n\`\`\`bash\n${verificationCommand}\n\`\`\`\n`;
}
```

---

## 3. Four-Tier Hierarchical Memory Architecture

Balances memory persistence with context budget limits:

| Memory Tier | Scope & Storage | Persistence Lifecycle | Eviction / Maintenance Strategy |
|:---|:---|:---|:---|
| **L1: Working Scratchpad** | Active prompt context and immediate tool outputs | Transient (single turn) | Discarded after each turn completion. |
| **L2: Session Trajectory** | `progress.md` and `BRIEFING.md` in agent folder | Active milestone session | Briefing ledger capped at $<100$ lines; older content archived to `BRIEFING_ARCHIVE.md`. |
| **L3: Domain Skill Tree** | `.agents/skills/<name>/SKILL.md` library | Permanent across projects | Indexed via frontmatter scan (~30 tokens); loaded strictly on-demand. |
| **L4: Session Archive** | `.agents/teamwork/` handoff reports and traces | Permanent historical record | Immutable write-once files; read only during post-mortems or succession. |

---

## 4. Context Density Compression Protocols (<30K Tokens)

Monolithic context preloading causes cognitive overload, hallucinations, and high inference latency. GenericAgent enforces strict compression protocols:

### 4.1 Lazy Skill Ingestion
- Never inject full `SKILL.md` packages into system prompts.
- Scan only the YAML `description` (~30–50 tokens per skill).
- Load the Markdown instructions **only** when trigger criteria match the user request.

### 4.2 High-Density Markdown Tables
- Express architectural decisions and mappings as dense markdown tables rather than verbose conversational paragraphs.
- Slices: Limit file viewing to targeted line ranges (`StartLine` / `EndLine`) $\le 150$ lines.

### 4.3 Briefing Ceiling Rule
- Keep active `BRIEFING.md` strictly under 100 lines.
- When lines exceed 100, move completed work logs to `BRIEFING_ARCHIVE.md`.

---

## 5. Verification Runbook

```bash
# 1. Frontmatter and line budget check
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/generic-agent/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*generic-agent/.test(yaml)) throw new Error('Missing name');
if (!/license:\s*MIT/.test(yaml)) throw new Error('Missing license');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Prohibited trigger');
const lines = content.split('\n').length;
if (lines > 400) throw new Error('Exceeds 400 lines: ' + lines);
console.log('PASS: generic-agent valid (' + lines + ' lines).');
"

# 2. Quality Gates check
npm run lint
npx tsc -b
npm test
npm run build
```
