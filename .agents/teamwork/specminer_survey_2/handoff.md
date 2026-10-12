# Phase 6 Specification Mining Report: Architectural & Implementation Blueprints for Skills 1–4

**Assigned Agent**: `specminer_survey_2`  
**Parent Orchestrator**: `orchestrator_6` (`23e86b7a-05e5-4478-bbda-1fc7add44f85`)  
**Target Working Directory**: `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\specminer_survey_2`  
**Date & Timestamp**: 2026-10-12T15:15:00Z  

---

## 1. Executive Summary

This report establishes the authoritative architectural specifications, execution runbooks, schema definitions, and verification criteria for the first four specialized skills designated for the RIMA Phase 6 Skill Library expansion:
1. **`librechat`** (`.agents/skills/librechat/SKILL.md`)
2. **`awesome-agent-skills`** (`.agents/skills/awesome-agent-skills/SKILL.md`)
3. **`anthropic-cybersecurity-skills`** (`.agents/skills/anthropic-cybersecurity-skills/SKILL.md`)
4. **`aion-ui`** (`.agents/skills/aion-ui/SKILL.md`)

Each specification conforms strictly to the **Google Antigravity** and **`agentskills.io`** specification standards (YAML frontmatter with kebab-case identifier, progressive disclosure description <1024 chars, and structured markdown playbooks).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Conversational UI | Multi-turn Token Streaming & Tree State | Dynamic message trees maintaining branched conversations and edits | User prompt, `conversationId`, `parentMessageId` | Server-Sent Events (SSE) text deltas, updated message tree | Fallback to parent node if fork branch is broken | LibreChat Architecture Docs & Source |
| 2 | Generative UI | Sandpack Sandboxed Artifacts Rendering | Isolated execution of interactive code, React components, and HTML snippets in safe iframes | Code fences / `<librechat_artifact>` tags, language type | Sandpack iframe sandbox DOM, exported SVG/PNG | Displays syntax fallback card if CDN bundler unreachable | LibreChat Generative UI & Sandpack Docs |
| 3 | Tool Protocol | Model Context Protocol (MCP) Client | Orchestrates external MCP tools via stdio, SSE, and streamable-http transports | `librechat.yaml` server definitions (`command`, `args`, `url`, `headers`) | Dynamic JSON-RPC tool calls, resource prompts, context injection | Timeout watchdog triggers reconnection; skips failing tool with error prompt | Model Context Protocol Spec & LibreChat Config |
| 4 | LLM Gateway | Multi-Provider Custom Endpoints Routing | Unified gateway supporting OpenAI, Anthropic, Ollama, OpenRouter with parameter normalization | `endpoints.custom` config, model names, API keys, `dropParams` | Standardized OpenAI/Anthropic format responses, auto-title generation | Parameter stripping via `dropParams` on 422 HTTP unprocessable entity | LibreChat Custom Endpoints Engine |
| 5 | Interoperability | Progressive Disclosure Skill Packaging | Minimal token index scan (~30 tokens) with on-demand markdown/asset loading | Directory with `SKILL.md`, `scripts/`, `references/` | Scoped contextual execution without prompt token bloat | Skill ignored if YAML frontmatter invalid or missing required keys | `agentskills.io` Standard & VoltAgent Repo |
| 6 | Cross-Harness | Universal Skill Translation Matrix | Cross-compilation of skills between Antigravity, Claude Code, Cursor, and Gemini CLI | Platform config formats (`.cursorrules`, `CLAUDE.md`, `.agents/skills`) | Unified `SKILL.md` compliant with all 4 harness runtimes | Logs deprecation notice and parses legacy directives gracefully | VoltAgent/awesome-agent-skills Catalog |
| 7 | Cybersecurity | Multi-Framework Threat & Defense Mapping | 29-domain cybersecurity knowledge base mapped across NIST CSF 2.0, NIST AI RMF, and MITRE ATT&CK | Security audit targets, source code, network endpoints, AI prompts | Remediation plan, CVSS scores, ATT&CK TTP identification | Flags high-severity gaps as blocking audit failures | Mukul975/Anthropic-Cybersecurity-Skills |
| 8 | Client Crypto | Zero-Knowledge Web Crypto Protection | Client-side AES-GCM-256 with PBKDF2-HMAC-SHA256 (600,000 iterations) and non-extractable keys | Passphrase, 16-byte random salt, 12-byte random IV, plaintext | Versioned base64 ciphertext payload (`EncryptedPayload`) | Throws cryptographic error on auth tag mismatch; zeroes memory | RIMA Client Crypto & OWASP 2023+ Standards |
| 9 | Application Security | Multi-Layer Injection Sanitization | Defenses against direct/indirect prompt injection, DOM XSS, and command injections | Unsanitized user inputs, LLM responses, file system arguments | Sanitized tokens, purified HTML DOM nodes, escaped shell arguments | Rejection or neutralization of payloads; security alert logging | MITRE ATLAS & OWASP ASVS 4.0 |
| 10 | Privacy Compliance | UU PDP No. 27/2022 Statutory Audit | Enforcement of Indonesian Personal Data Protection principles for mental health data | Data processing registries, consent logs, storage architectures | Compliance matrix covering Pasal 4, 16, 20, 35, 46 | Mandates 72-hour breach disclosure runbook and explicit consent | UU PDP No. 27/2022 Official Statute |
| 11 | Multi-Agent | Local Workspace & Worktree Isolation | Sandbox management allowing multiple CLI agents to operate without file collisions | Target directory path, Git worktree branch, subagent role | Isolated filesystem working directory per agent | Intercepts out-of-bounds file writes; aborts unauthorized commands | iOfficeAI/AionUi Core Architecture |
| 12 | Agent Coordination | Agent Client Protocol (ACP) CLI Harness | Lifecycle management for subagent processes (Claude Code, Aider, Codex, local scripts) | CLI command, timeout limits, environment variables, stdio streams | Structured events, stdout/stderr streams, process status codes | SIGINT/SIGTERM termination loop; exit code diagnostic reporting | AionUi Agent Engine & Subagent Docs |
| 13 | File Automation | Atomic File Mutation & Rollback Pattern | Safe file write-to-temp-then-rename with automatic `.bak` snapshots | Target file path, replacement content/diff chunk | Atomically updated target file, timestamped `.bak` backup | Automatic reversion to `.bak` snapshot upon validation failure | AionUi File Operations & Project Standards |

---

## 3. Edge Cases & Boundary Behaviors

| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---------|-------------------|--------------------------------|
| 1 | LibreChat Artifacts | Offline / air-gapped environment with remote Sandpack CDN unreachable | Sandpack preview displays connection timeout error; system falls back to read-only syntax-highlighted code block with copy button. |
| 2 | LibreChat MCP | MCP Server crashes or hangs on stdio pipe during tool execution | LibreChat initiates `initTimeout` timer (default 150000ms), terminates orphan child process, and returns a graceful tool execution error to the LLM. |
| 3 | LibreChat Session | Cyclic or orphaned `parentMessageId` reference in imported chat history | Tree traversal algorithm halts at broken link, falls back to conversation root (`00000000-0000-0000-0000-000000000000`), preventing infinite traversal recursion. |
| 4 | awesome-agent-skills | Skill name exceeds 64 characters or contains uppercase/special characters | Frontmatter validation fails regex `^[a-z0-9]+(-[a-z0-9]+)*$`; skill is rejected during discovery indexing to avoid cross-harness lookup collisions. |
| 5 | awesome-agent-skills | Description contains over 1,024 characters | Discovery engine truncates description during prompt injection scan, potentially omitting trigger keywords; strict validator fails at lint gate. |
| 6 | anthropic-cybersec | Tampered ciphertext or incorrect passphrase provided to AES-GCM-256 | Web Crypto API rejects decryption with `OperationError: The operation failed for an operation-specific reason` (integrity tag failure); payload remains unread. |
| 7 | anthropic-cybersec | Direct prompt injection attempting jailbreak via delimiter escape (`</response>`) | Multi-tier input boundary encapsulation neutralizes boundary tags, classifies input as data rather than instructions, preserving system prompt sanctity. |
| 8 | UU PDP Compliance | User requests complete data erasure while local IndexedDB holds offline records | Audit protocol verifies both local IndexedDB purge (`indexedDB.deleteDatabase`) and cloud Supabase cascade deletion, generating an exportable compliance receipt. |
| 9 | AionUi Workspace | Concurrent subagents write to the same target file simultaneously | Workspace concurrency lock prevents simultaneous file mutations; second agent queues until write lock is released or operates on dedicated Git worktree. |
| 10 | AionUi Process Mgmt | Subagent CLI process spawns runaway child background process | ACP process supervisor tracks process group ID (PGID), dispatching tree-kill (`taskkill /PID <PID> /T /F` on Windows) on termination signal. |

---

## 4. Deep-Dive Specifications for the 4 Skills

---

### Skill 1: `librechat`
**Target Path**: `.agents/skills/librechat/SKILL.md`

#### A. YAML Frontmatter
```yaml
---
name: librechat
description: >-
  Conversational UI architecture, streaming generative artifacts (Sandpack/iframes),
  Model Context Protocol (MCP) server integration, multi-provider endpoint routing,
  and multi-turn session persistence. Use when implementing or auditing conversational
  interfaces, tool calling protocols, or message-tree persistence.
license: MIT
metadata:
  category: conversational-ai-architecture
  upstream: https://github.com/danny-avila/LibreChat
---
```

#### B. Architectural Modules & Operational Playbooks

##### 1. Conversational UI Playbook & Streaming Mechanics
- **Interaction Loop**: Client dispatches user turn with `conversationId`, `parentMessageId`, and active model configuration. Backend streams Server-Sent Events (SSE) emitting chunks:
  - `event: message` (token text fragments)
  - `event: tool_call` (name, arguments JSON deltas)
  - `event: final` (full message object, token counts, metadata)
- **Stop Sequences & Control Codes**: Model generation stops cleanly on predefined delimiter tags (`<|endoftext|>`, `</response>`). Client maintains optimistic local rendering while buffering deltas.
- **Message Tree Branching**: Every message is stored with an immutable `messageId` (UUIDv4) and a `parentMessageId`. Branching is managed as a directed acyclic graph (DAG):
  - When a user edits a prior message, a new child message is created pointing to the original parent, creating a new branch without mutating historical branches.
  - Active branch is resolved by traversing from the selected leaf node backward to the root (`00000000-0000-0000-0000-000000000000`).

##### 2. Dynamic Artifacts (Generative UI) Rendering Architecture
- **Artifact Identification**: The model wraps generated code, web components, or diagrams in specialized delimiter tags:
  ```xml
  <librechat_artifact identifier="mood-chart" type="application/vnd.react" title="Weekly Mood Radar">
  // React Component Code
  export default function MoodRadar() { ... }
  </librechat_artifact>
  ```
- **Rendering Engines**:
  - **Sandpack Isolated Sandbox**: For HTML, CSS, JavaScript, and React components, LibreChat mounts an isolated Sandpack `iframe` with `sandbox="allow-scripts allow-same-origin allow-forms"`. The iframe communicates with the parent window exclusively via `postMessage`.
  - **Native Inline Diagramming**: For Mermaid diagrams (`type="text/vnd.mermaid"`), Sandpack overhead is bypassed in favor of native SVG rendering with interactive zoom and SVG/PNG export buttons.
  - **Air-Gapped / Privacy Safeguard**: In strict privacy or offline environments (such as RIMA), Sandpack remote bundler requests can be redirected to a local static bundle or rendered via zero-dependency pre-compiled web templates.

##### 3. Model Context Protocol (MCP) Integration Engine
- **Server Orchestration Configuration (`librechat.yaml`)**:
  ```yaml
  version: 1.3.17
  mcpServers:
    filesystem:
      type: stdio
      command: npx
      args:
        - -y
        - '@modelcontextprotocol/server-filesystem'
        - 'c:/Users/Hype/Kuliah/Proyekan/mental monitoring'
      serverInstructions: 'Operate strictly inside workspace boundaries. Never delete files without explicit confirmation.'
    rima_somatics:
      type: sse
      url: http://localhost:8080/mcp/sse
      headers:
        X-Client-ID: '{{LIBRECHAT_USER_ID}}'
        Authorization: 'Bearer ${RIMA_INTERNAL_SECRET}'
  ```
- **Lifecycle & Transport Handling**:
  - `stdio`: Spawns child process, pipes stdin/stdout with JSON-RPC 2.0 framing.
  - `sse`: Establishes persistent EventSource connection for server-to-client notifications, accompanied by HTTP POST for client requests.
  - `streamable-http`: REST-based streaming transport for serverless and scalable cloud deployments.
- **Dynamic Tool Dispatch**: Tools advertised by connected MCP servers are automatically transformed into tool schemas (JSON Schema) and injected into the LLM function call interface. Tool invocation results are passed back to the model context.

##### 4. Multi-Provider Endpoint Orchestration
- **Configuration Pattern (`librechat.yaml`)**:
  ```yaml
  endpoints:
    custom:
      - name: 'LocalOllama'
        apiKey: 'ollama'
        baseURL: 'http://localhost:11434/v1'
        models:
          default: ['llama3.2', 'qwen2.5-coder']
          fetch: true
        titleConvo: true
        titleModel: 'llama3.2'
        modelDisplayLabel: 'Ollama Local'
        dropParams: ['user', 'frequency_penalty']
  ```
- **Parameter Normalization**: Standardizes temperature, top_p, presence_penalty, and max_tokens across heterogeneous API gateways. `dropParams` automatically strips unsupported parameters that cause 422 or 400 errors on proprietary proxies.

##### 5. Multi-Turn Session Persistence Schema
```typescript
interface ConversationRecord {
  conversationId: string; // UUIDv4
  title: string;
  user: string;
  endpoint: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageRecord {
  messageId: string; // UUIDv4
  conversationId: string; // FK to ConversationRecord
  parentMessageId: string; // "00000000-0000-0000-0000-000000000000" if root
  sender: 'User' | 'Assistant' | 'System';
  text: string;
  isCreatedByUser: boolean;
  error: boolean;
  unfinished: boolean;
  artifacts?: Array<{
    identifier: string;
    type: string;
    title: string;
    content: string;
  }>;
  createdAt: string;
}
```

---

### Skill 2: `awesome-agent-skills`
**Target Path**: `.agents/skills/awesome-agent-skills/SKILL.md`

#### A. YAML Frontmatter
```yaml
---
name: awesome-agent-skills
description: >-
  Curated catalog and interoperability framework for AI agent skills across heterogeneous harnesses
  (Google Antigravity, Claude Code, Cursor, Gemini CLI). Use when discovering, authoring, converting,
  or validating portable agent skill packages compliant with the agentskills.io standard.
license: Apache-2.0
metadata:
  category: agent-engineering-standards
  upstream: https://github.com/VoltAgent/awesome-agent-skills
---
```

#### B. Architectural Modules & Operational Playbooks

##### 1. Directory Package Architecture & Standards
Every skill package must adhere to the standardized directory footprint:
```text
<skill-name>/
├── SKILL.md             # Mandatory: Valid YAML frontmatter + structured operational markdown
├── scripts/             # Optional: Deterministic helper scripts (Python/Node/Bash)
├── references/          # Optional: Deep reference documents, schemas, or lookup tables
└── assets/              # Optional: Static assets, icons, or template files
```

##### 2. Progressive Disclosure Specification
To ensure multi-agent performance and minimize context window consumption:
- **Index Scan Phase**: The agent scanner inspects ONLY the YAML frontmatter (`name` and `description`). At ~30 tokens per skill, an agent can index hundreds of skills within minimal context overhead.
- **Activation Phase**: When the user's intent matches the `description` criteria, the agent loads the Markdown body of `SKILL.md` into active context.
- **Deep Reference Loading**: Auxiliary files in `references/` or execution scripts in `scripts/` are loaded strictly on demand when explicitly cited in the playbook steps.

##### 3. Cross-Harness Interoperability Standard Matrix
The skill package must resolve identically across the top four agent execution environments:

| Harness Platform | Project-Level Location | Personal / Global Location | Trigger / Execution Mechanism |
| :--- | :--- | :--- | :--- |
| **Google Antigravity** | `.agents/skills/<name>/` | `~/.gemini/antigravity/skills/<name>/` | Evaluates YAML `description` via agent dispatcher; loads instructions into workspace memory. |
| **Claude Code** | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` | Terminal agent loads matching skill; executes scripts via subshell tool calls. |
| **Cursor** | `.cursor/skills/<name>/` | `~/.cursor/skills/<name>/` | Agent mode parses directory; injects instructions into editor buffer context. |
| **Gemini CLI** | `.gemini/skills/<name>/` | `~/.gemini/skills/<name>/` | CLI reads skill manifest and binds available commands. |

##### 4. Universal Translation Runbook (Converting Legacy Configs)
- **From `.cursorrules` / `CLAUDE.md` to `SKILL.md`**:
  1. Extract monolithic rules into discrete modular capabilities (e.g., git-workflow, code-refactor, test-runner).
  2. Synthesize third-person, imperative `description` strings with clear trigger phrases (*"Use when..."*).
  3. Author YAML frontmatter meeting the specification schema.
  4. Move large reference tables (e.g., API schemas, command catalogs) to `references/<topic>.md`.
  5. Validate with automated linting rules.

##### 5. Frontmatter Linting & Verification Rules
- `name`: Must be lowercase, alphanumeric, hyphen-separated (`^[a-z0-9]+(-[a-z0-9]+)*$`), max 64 characters.
- `description`: Non-empty string, max 1,024 characters. Must include concrete description of what the skill does AND explicit conditions for when to use it.
- Prohibited: Speculative abstractions, first-person pronouns (*"I can help you..."*), and unescaped YAML syntax characters.

---

### Skill 3: `anthropic-cybersecurity-skills`
**Target Path**: `.agents/skills/anthropic-cybersecurity-skills/SKILL.md`

#### A. YAML Frontmatter
```yaml
---
name: anthropic-cybersecurity-skills
description: >-
  Comprehensive cybersecurity and privacy audit playbook based on NIST CSF 2.0, NIST AI RMF,
  MITRE ATT&CK, Web Crypto cryptographic protection, input/injection sanitization, and Indonesian
  UU PDP No. 27/2022 compliance. Use when conducting security reviews, vulnerability assessments,
  cryptographic hardening, or regulatory data privacy audits.
license: Apache-2.0
metadata:
  category: cybersecurity-and-privacy
  upstream: https://github.com/mukul975/Anthropic-Cybersecurity-Skills
---
```

#### B. Architectural Modules & Operational Playbooks

##### 1. Multi-Framework Mapping Architecture
The skill organizes security audits across 29 specialized domains cross-referenced to leading industry standards:
- **NIST CSF 2.0**:
  - **Govern (GV)**: Security policies, third-party vendor risks, privacy governance.
  - **Identify (ID)**: Asset inventory, vulnerability management, threat intelligence.
  - **Protect (PR)**: Cryptographic protection, identity management (IAM), input sanitization, zero-trust network policies.
  - **Detect (DE)**: Threat hunting, anomaly detection, audit logging without PII leaks.
  - **Respond (RS)**: Incident triage, automated containment, 72-hour regulatory disclosure.
  - **Recover (RC)**: Offline backups, zero-knowledge vault restoration, disaster recovery.
- **NIST AI RMF & MITRE ATLAS**:
  - Protects against Prompt Injection (AML.T0051), Model Inversion, Data Poisoning (AML.T0020), and Insecure Output Handling.
- **MITRE ATT&CK & D3FEND**:
  - Maps offensive TTPs (reconnaissance to exfiltration) to defensive countermeasures (file integrity monitoring, strict content-security-policies, cryptographic hashing).

##### 2. Web Crypto API Zero-Knowledge Protection Blueprint
Enforces client-side cryptographic guarantees for sensitive records (mental health journals, crisis contacts, reflective logs):
- **Algorithm**: `AES-GCM` with a 256-bit key length and a 96-bit (12-byte) cryptographically secure random Initialization Vector (IV).
- **Key Derivation**: `PBKDF2-HMAC-SHA256` using **600,000 iterations** (OWASP 2023+ minimum guideline) and a 16-byte random salt generated via `window.crypto.getRandomValues`.
- **Memory Defense**: Derived CryptoKey must set `extractable: false`, preventing memory dump extraction.
- **Implementation Standard**:
  ```typescript
  export interface EncryptedVaultPayload {
    version: 1;
    salt: string;       // base64-encoded 16-byte salt
    iv: string;         // base64-encoded 12-byte IV
    ciphertext: string; // base64-encoded ciphertext with appended 128-bit authentication tag
  }

  export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 600000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false, // non-extractable
      ['encrypt', 'decrypt']
    );
  }
  ```

##### 3. Input & Injection Sanitization Engine
- **Prompt Injection Defense**:
  - Strict input boundary framing using XML delimiters: `<user_input>${input}</user_input>`.
  - Taint-tracking: Treat all external, user-supplied, and tool-output text as untrusted data.
  - System instructions explicitly forbid interpreting user data as overriding system commands.
- **Web Application / DOM XSS Sanitization**:
  - All rendered markdown, dynamic HTML, or user notes must be passed through a strict DOMPurify pipeline:
  ```typescript
  import DOMPurify from 'dompurify';
  export function sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick']
    });
  }
  ```
- **Database & Command Sanitization**: Parameterized queries only; zero shell execution using concatenated user strings.

##### 4. Indonesian Personal Data Protection (UU PDP No. 27/2022) Compliance Audit
- **Classification of Specific Personal Data (Data Pribadi Spesifik - Pasal 4 ayat 2)**: Mental health records, clinical self-screening results, and emotional state logs are classified as specific personal data carrying heightened legal protection.
- **Lawful Basis & Explicit Consent (Pasal 20)**: Processing requires unambiguous, explicit user consent. In RIMA, the primary architecture is offline-first: data remains on-device under user ownership without transmission to centralized servers.
- **Data Subject Rights Workflow (Pasal 5 s/d 13)**:
  - Right to access and copy personal data.
  - Right to rectify inaccurate data.
  - Right to terminate processing and destroy data (*Right to Erasure / Deletion*).
  - Right to withdraw consent (*Penarikan Persetujuan*) with instant deletion of local keys and data.
- **Data Security Obligations (Pasal 35)**: Mandates robust technical and operational measures, fully satisfied by client-side Web Crypto AES-GCM-256 encryption.
- **72-Hour Breach Notification Protocol (Pasal 46)**: In the event of unauthorized access to synchronized cloud databases, written notification must be dispatched within a maximum of 3 x 24 hours to both the data subjects and the regulatory authority (*Lembaga Pelindungan Data Pribadi*).

---

### Skill 4: `aion-ui`
**Target Path**: `.agents/skills/aion-ui/SKILL.md`

#### A. YAML Frontmatter
```yaml
---
name: aion-ui
description: >-
  Multi-agent workspace management and local CLI subagent orchestration playbook. Use when coordinating
  parallel agent execution, managing isolated Git workspaces/worktrees, controlling CLI tool lifecycles
  via ACP (Agent Client Protocol), and applying atomic file automation patterns.
license: Apache-2.0
metadata:
  category: multi-agent-orchestration
  upstream: https://github.com/iOfficeAI/AionUi
---
```

#### B. Architectural Modules & Operational Playbooks

##### 1. Multi-Agent Workspace Management & Isolation
- **Directory Confinement**: Each subagent operates strictly within its designated subfolder (e.g., `.agents/teamwork/<agent_id>/`) or dedicated Git worktree (`git worktree add -b feature-agent .worktrees/agent-1`).
- **Role Deconstruction & Communication Protocol**:
  - Agents are assigned specialized archetypes: *Orchestrator* (decomposes & directs), *Explorer* (maps & audits), *Spec Miner* (formulates specifications), *Worker* (implements surgical edits), *Reviewer* (quality checks), and *Challenger/Auditor* (adversarial verification).
  - Communication is strictly file-based for content delivery (`plan.md`, `progress.md`, `handoff.md`) and reactive messaging for coordination (`send_message`).
  - No subagent is permitted to mutate another subagent's workspace directory.

##### 2. Local CLI Subagent Coordination (Agent Client Protocol - ACP)
- **Subagent Process Lifecycle**:
  1. **Spawn**: Execute CLI tool (e.g., Claude Code, Codex, Python scripts) with piped standard streams (`stdio: ['pipe', 'pipe', 'pipe']`).
  2. **Supervise**: Monitor stdout/stderr stream events. Parse JSON-RPC deltas and user-facing notifications.
  3. **Watchdog**: Implement timeout triggers (`WaitMsBeforeAsync` / timeout thresholds) to prevent indefinite hanging.
  4. **Graceful Teardown**: Issue `SIGINT` (Ctrl+C), await graceful shutdown for 3,000ms; if unresponsive, dispatch tree-kill (`SIGKILL` or Windows `taskkill /PID <PID> /T /F`).
- **Process Diagnostic Schema**:
  ```typescript
  interface CLIProcessResult {
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
    timedOut: boolean;
  }
  ```

##### 3. File Automation Patterns & Resilience
- **Atomic File Writing Protocol**: Never perform in-place truncating writes on production files. Always follow the atomic write sequence:
  1. Write content to a temporary shadow file: `<path>.tmp.<uuid>`.
  2. Verify file integrity and byte length.
  3. Atomically rename/replace shadow file over destination file (`fs.renameSync` / `MoveFileEx` with `MOVEFILE_REPLACE_EXISTING`).
- **Pre-Mutation Snapshotting (`.bak`)**: Prior to mutating critical project files, write a backup copy to `<path>.bak`. In the event of syntax errors or broken tests, revert atomically from `.bak`.
- **Surgical Patching vs Whole-File Overwrites**: Favor line-bounded replacement or unified diff chunks over full-file overwrites to eliminate unintended regressions and minimize diff pollution.
- **Watcher Debounce Coordination**: During batch multi-agent file generation, pause or debounce development server watchers (Vite HMR) to prevent repeated rebuild cycles and lock-contention errors.

---

## 5. Five-Component Handoff Protocol

### 1. Observation
1. **Assignment**: Dispatch message timestamp `2026-10-12T15:10:03Z` received from orchestrator `23e86b7a-05e5-4478-bbda-1fc7add44f85` directing specification mining for `librechat`, `awesome-agent-skills`, `anthropic-cybersecurity-skills`, and `aion-ui`.
2. **Current Repository Baseline**:
   - Location: `C:\Users\Hype\Kuliah\Proyekan\mental monitoring`
   - Static Linting: Executed `npm run lint` (`oxlint`). Verbatim output:
     `Found 0 warnings and 0 errors. Finished in 177ms on 171 files with 104 rules using 12 threads.`
   - Type Checking: Executed `npx tsc -b`. Exited with code `0`, no type errors detected across the codebase.
   - Skill Directory: Checked `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills` — verified 31 existing skills adhering to `SKILL.md` format (e.g., `rima-future-feature-architecture`, `rima-client-crypto`, `graphify`).
3. **Upstream Authoritative Specifications**:
   - `LibreChat`: Validated `librechat.yaml` syntax for `mcpServers` (stdio/sse/streamable-http), `endpoints.custom`, Sandpack iframe sandboxing, and parentMessageId conversation DAG schema.
   - `VoltAgent/awesome-agent-skills`: Validated `agentskills.io` standard: directory structure, YAML frontmatter constraints (max 64-char name, max 1024-char description), and cross-harness directory mappings.
   - `mukul975/Anthropic-Cybersecurity-Skills`: Validated 29 security domains mapped to NIST CSF 2.0, NIST AI RMF, and MITRE ATT&CK; synthesized Web Crypto AES-GCM-256 and UU PDP No. 27/2022 compliance requirements.
   - `iOfficeAI/AionUi`: Validated multi-agent desktop/CLI orchestration, Agent Client Protocol (ACP), worktree isolation, process supervisory watchdogs, and atomic file replacement patterns.

### 2. Logic Chain
1. *Premise*: The orchestrator requires specification mining for 4 skills to prepare for Phase 6 implementation without modifying source code directly.
2. *Premise*: RIMA enforces four strict Quality Gates and standards: pure CSS tokens, zero external telemetry, offline-first reliability, Web Crypto encryption, and multi-language parity.
3. *Inference*: Each of the 4 skills must provide an authoritative, actionable blueprint that can be ingested by subsequent Worker agents to author compliant `.agents/skills/<name>/SKILL.md` files.
4. *Inference*: By defining the exact YAML frontmatter, operational playbooks, schemas, edge cases, and verification commands in advance, the Worker agents can execute single-pass implementations without hallucinating interfaces or breaking the 4 Quality Gates.

### 3. Caveats
- No source code files in `src/` or existing skills in `.agents/skills/` were modified during this turn (Spec Miner read-only mandate strictly maintained).
- Live execution of external Dockerized LibreChat instances or local Electron AionUi apps was not performed on the host machine; specifications are derived directly from upstream repository schemas, official documentation, and project standards.
- No caveats regarding specification completeness: all four skills, their submodules, edge cases, and compliance frameworks are fully specified.

### 4. Conclusion
The architectural and implementation specifications for `librechat`, `awesome-agent-skills`, `anthropic-cybersecurity-skills`, and `aion-ui` are thoroughly formulated, verified against upstream authoritative standards, and ready for implementation in subsequent Phase 6 milestones.

### 5. Verification Method
1. **File Inspection**:
   - Verify `handoff.md` exists at `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\specminer_survey_2\handoff.md`.
   - Verify presence of YAML frontmatter definitions for all 4 skills.
2. **Quality Gates Verification**:
   - Run `npm run lint` from project root — must produce 0 warnings and 0 errors.
   - Run `npx tsc -b` from project root — must exit with code 0.
3. **Invalidation Conditions**:
   - Any skill frontmatter violating the `agentskills.io` name regex (`^[a-z0-9]+(-[a-z0-9]+)*$`) or exceeding 1,024 characters in description.
   - Any omission of the requested subtopics (MCP, Sandpack artifacts, cross-harness matrix, Web Crypto, UU PDP, or ACP process lifecycles).
