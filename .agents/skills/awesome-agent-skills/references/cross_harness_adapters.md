# Cross-Harness Interoperability Adapters & Runtime Schemas

This document defines the translation schemas, directory mappings, manifest formats, and adapter generation routines to deploy `agentskills.io` standard skill packages across heterogeneous AI agent harnesses: Google Antigravity, Claude Code, Cursor, and Gemini CLI.

---

## 1. Unified Harness Platform Matrix

| Architectural Dimension | Google Antigravity | Claude Code | Cursor IDE | Gemini CLI |
| :--- | :--- | :--- | :--- | :--- |
| **Project-Level Path** | `.agents/skills/<name>/SKILL.md` | `.claude/skills/<name>/SKILL.md` | `.cursor/rules/<name>.mdc` | `.gemini/skills/<name>/SKILL.md` |
| **Global User Path** | `~/.gemini/antigravity/skills/<name>/` | `~/.claude/skills/<name>/` | `~/.cursor/rules/<name>.mdc` | `~/.gemini/skills/<name>/` |
| **Manifest Format** | YAML Frontmatter in Markdown | YAML Frontmatter in Markdown | Frontmatter in `.mdc` format | YAML Frontmatter in Markdown |
| **Discovery Model** | Semantic match on `description` | Semantic match + subshell tools | `globs` matching + `alwaysApply` | Command binding + semantic match |
| **Script Execution** | Tool call / subprocess invocation | Native Bash tool subshell | Terminal commands / extension | CLI subprocess invocation |
| **Context Injection** | Lazy on-demand workspace loading | Injected upon prompt trigger | Injected into editor model context | Read into session context |

---

## 2. Cursor `.mdc` Adapter Schema & Generator

Cursor parses rules with `.mdc` extensions located in `.cursor/rules/`. Unlike standard skills, Cursor rules support file-targeting glob patterns (`globs`) and automatic global application (`alwaysApply`).

### 2.1 Target `.mdc` Schema Format
```markdown
---
description: <description extracted from SKILL.md>
globs: <glob pattern, e.g. "src/**/*.{ts,tsx}", "**/*">
alwaysApply: false
---

# <Title from SKILL.md>

[Operational SOP and instructions from SKILL.md]
```

### 2.2 Automated Node.js Adapter Generator
```javascript
// scripts/generate_cursor_adapter.js
const fs = require('fs');
const path = require('path');

function convertSkillToCursorMdc(skillFilePath, outputMdcPath, globs = '**/*') {
  const content = fs.readFileSync(skillFilePath, 'utf8');
  if (!content.startsWith('---\n')) {
    throw new Error('Invalid skill: missing frontmatter');
  }

  const endIdx = content.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    throw new Error('Malformed frontmatter delimiter');
  }

  const frontmatter = content.substring(4, endIdx);
  const body = content.substring(endIdx + 5).trim();

  // Extract description folded scalar or single line
  const descMatch = frontmatter.match(/description:\s*>-?([\s\S]+?)(?=\n[a-z0-9_-]+:|$)/i);
  const description = descMatch
    ? descMatch[1].replace(/\r?\n\s*/g, ' ').trim()
    : 'Exported agent skill rule';

  const mdcContent = `---
description: "${description.replace(/"/g, '\\"')}"
globs: "${globs}"
alwaysApply: false
---

${body}
`;

  fs.mkdirSync(path.dirname(outputMdcPath), { recursive: true });
  fs.writeFileSync(outputMdcPath, mdcContent, 'utf8');
  console.log(`Generated Cursor MDC rule at: ${outputMdcPath}`);
}

module.exports = { convertSkillToCursorMdc };
```

---

## 3. Claude Code Adapter Pattern

Claude Code supports modular skills situated in `.claude/skills/<name>/SKILL.md` or global user skills in `~/.claude/skills/<name>/`.

### 3.1 Subshell Tool Execution Contract
Claude Code provides native Bash tool execution (`bash -c "<command>"`). Companion utilities in `scripts/` can be directly executed:
```bash
# Example invocation by Claude Code:
node .claude/skills/awesome-agent-skills/scripts/verify.js
```

### 3.2 Workspace Deployment (Symlink vs Copy)
- **Windows (PowerShell as Administrator or Developer Mode)**:
  ```powershell
  New-Item -ItemType SymbolicLink -Path ".claude\skills\awesome-agent-skills" -Target ".agents\skills\awesome-agent-skills"
  ```
- **POSIX (Linux / macOS)**:
  ```bash
  mkdir -p .claude/skills
  ln -s "$(pwd)/.agents/skills/awesome-agent-skills" ".claude/skills/awesome-agent-skills"
  ```
- **Fallback Copy Script**:
  ```bash
  # Zero-dependency copy when symlinks are restricted
  node -e "
  const fs = require('fs');
  fs.cpSync('.agents/skills/awesome-agent-skills', '.claude/skills/awesome-agent-skills', { recursive: true });
  console.log('Synchronized awesome-agent-skills to .claude/skills/');
  "
  ```

---

## 4. Google Antigravity Harness Adapter

Google Antigravity adheres to the native `agentskills.io` layout without requiring translation:
- Project location: `.agents/skills/<name>/SKILL.md`.
- Global user location: `~/.gemini/antigravity/skills/<name>/SKILL.md`.
- Evaluates `name` and `description` to conditionally load skills when triggered by agent task planning or tool calls.
- Enforces strict token density constraints (<30K tokens working memory).

---

## 5. Gemini CLI Adapter Pattern

Gemini CLI reads skill packages located in `.gemini/skills/<name>/SKILL.md`.

### 5.1 CLI Skill Registration Manifest
When registering a skill in Gemini CLI configurations (`gemini.config.json`):
```json
{
  "skills": {
    "awesome-agent-skills": {
      "path": ".agents/skills/awesome-agent-skills/SKILL.md",
      "enabled": true,
      "autoTrigger": true
    }
  }
}
```

### 5.2 Verification Checklist
- [ ] Frontmatter YAML contains lowercase alphanumeric `name`.
- [ ] Description specifies both capabilities and explicit trigger phrases ("Use when...").
- [ ] No `trigger: always_on` present (only valid for `.agents/rules/*.md`).
- [ ] Total lines per file < 400 lines.
