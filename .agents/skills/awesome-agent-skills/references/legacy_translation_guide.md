# Legacy Configuration Translation Runbook

A systematic guide for migrating monolithic legacy AI agent configuration files (`.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.copilot-instructions.md`) into modular, progressive-disclosure skill packages compliant with `agentskills.io` and Google Antigravity.

---

## 1. Pitfalls of Legacy Monolithic Configurations

1. **Context Window Thrashing**: Monolithic config files (often 500–2,000 lines) are injected into **every single prompt turn**, burning 3,000–10,000 tokens per interaction.
2. **Prompt Dilution & Hallucination**: Flooding the prompt context with dozens of unrelated rules causes the LLM to experience the "lost-in-the-middle" effect, missing core architectural guardrails.
3. **Vendor Lock-in & Duplication**: `.cursorrules` is unusable in Claude Code or Antigravity; `CLAUDE.md` is unusable in Cursor. Teams end up duplicating rules across multiple files that quickly drift apart.

---

## 2. The 6-Step Migration Pipeline

```text
[Legacy Monolith (.cursorrules, CLAUDE.md, .windsurfrules)]
                          │
                          ▼
            [Step 1: Inventory & Tagging]
            ├── [GOV] Governance & Invariants
            ├── [STY] Code Styling & Design Tokens
            ├── [WRK] Procedural Task Workflows
            └── [REF] Schemas, APIs & Cheat Sheets
                          │
                          ▼
            [Step 2: Rules vs. Skills Separation]
             ├── Invariants  ──► .agents/rules/*.md (trigger: always_on)
             └── Procedures  ──► .agents/skills/<name>/SKILL.md
                          │
                          ▼
            [Step 3: YAML Frontmatter Authoring]
            (name: kebab-case, description with trigger keywords)
                          │
                          ▼
            [Step 4: Progressive Disclosure Factoring]
            (SKILL.md < 400 lines + references/<topic>.md)
                          │
                          ▼
            [Step 5: Harness Adapter Generation]
            (Generate Cursor .mdc, Claude Code, Gemini CLI links)
                          │
                          ▼
            [Step 6: Automated Schema & Line Budget Validation]
```

### Detailed Execution Steps

#### Step 1: Inventory & Domain Tagging
Scan the legacy monolith line-by-line and annotate blocks with one of four operational tags:
- `[GOV]`: Mandatory governance, compliance, security, and safety constraints.
- `[STY]`: Code formatting, naming conventions, design tokens, and style linting.
- `[WRK]`: Procedural task instructions (e.g., TDD loop, git commit conventions, PR audits, migrations).
- `[REF]`: Static schemas, SQL table dumps, API endpoints, or glossary tables.

#### Step 2: Separate System Rules vs. Modular Skills
- **System Rules (`.agents/rules/<name>.md`)**:
  - Applies to: `[GOV]` and fundamental `[STY]` constraints.
  - Frontmatter: Requires `trigger: always_on` and `description: >-`.
  - Behavior: Always active in prompt memory.
- **Modular Skills (`.agents/skills/<name>/SKILL.md`)**:
  - Applies to: `[WRK]` procedures and domain-specific knowledge.
  - Frontmatter: Requires `name: <kebab-case>` and `description: >-` with explicit trigger criteria (*"Use when..."*).
  - Prohibited: MUST NEVER declare `trigger: always_on`.
  - Behavior: Lazy-loaded on demand when intent matches.

#### Step 3: Author agentskills.io YAML Frontmatter
Ensure the frontmatter conforms strictly to standard YAML:
```yaml
---
name: code-review-auditor
description: >-
  Adversarial multi-persona code review, static analysis verification,
  and security auditing. Use when reviewing pull requests, inspecting code
  quality, or performing security audits.
license: Apache-2.0
---
```

#### Step 4: Progressive Disclosure Factoring
If the procedural instructions plus reference tables exceed 400 lines:
1. Retain the core SOP, decision tree, and operational commands in `SKILL.md` (<400 lines).
2. Move large schemas, catalogs, and cheat sheets (`[REF]`) into `references/<topic>.md`.
3. Place executable utilities in `scripts/<utility>.js`.

#### Step 5: Generate Cross-Harness Adapters
Deploy adapters for target environments:
- For Cursor: Run `scripts/generate_cursor_adapter.js` to create `.cursor/rules/<name>.mdc`.
- For Claude Code: Symlink or copy to `.claude/skills/<name>/`.
- For Gemini CLI: Reference in `gemini.config.json`.

#### Step 6: Automated Validation Runbook
Verify frontmatter syntax, line counts, and ensure zero regressions across repository quality gates.

---

## 3. Concrete Case Study: Migrating Monolithic `.cursorrules`

### Before: Monolithic `.cursorrules` (Fragment of 800+ Lines)
```markdown
You are an expert full-stack engineer.
Never use Tailwind CSS under any circumstances. Always use pure vanilla CSS design tokens.
Always test code with npm test.
When performing code reviews:
1. Act as a security auditor.
2. Check for SQL injection and XSS.
3. Report line-by-line findings.
Here is the complete database schema:
CREATE TABLE users (id uuid primary key, email text...);
-- (200 lines of SQL schema follow)
```

### After: Decomposed Modular Architecture
1. **Always-On Rule** (`.agents/rules/styling_guardrails.md`):
   ```yaml
   ---
   trigger: always_on
   description: Pure vanilla CSS design token governance prohibiting Tailwind CSS.
   ---
   # Zero Tailwind CSS & Pure Vanilla CSS Token Governance
   ...
   ```
2. **Modular Skill** (`.agents/skills/code-review/SKILL.md`):
   ```yaml
   ---
   name: code-review
   description: >-
     Adversarial code review and security audit protocol. Use when auditing
     pull requests or reviewing source code changes.
   license: Apache-2.0
   ---
   # Code Review Protocol
   ...
   ```
3. **Domain Reference** (`.agents/skills/database-ops/references/schema.sql`):
   - Database schema isolated in reference folder, loaded into context only when database queries or migrations are executed.

---

## 4. Quality Checklist for Translated Skills

- [ ] Every skill directory name matches `name:` in `SKILL.md` exactly.
- [ ] Frontmatter opens and closes with `---` delimiters at Line 1.
- [ ] Description contains explicit trigger phrases ("Use when...").
- [ ] No modular skill contains `trigger: always_on`.
- [ ] All `.md` files are strictly under 400 lines.
- [ ] Repository test suite and linters continue to pass cleanly.
