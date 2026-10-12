# Milestone 2 (M2) Explorer Handoff: LibreChat MCP Architecture, Endpoint Orchestration & DAG Session Persistence

**Agent ID**: `explorer_m2_2`  
**Parent Orchestrator ID**: `23e86b7a-05e5-4478-bbda-1fc7add44f85`  
**Working Directory**: `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m2_2`  
**Date**: 2026-10-12T15:55:00Z  
**Target Milestone**: Phase 6 Milestone 2 (M2: Conversational UI & Interoperability Skills)  
**Primary Target Artifact**: `.agents/skills/librechat/SKILL.md` (and supporting architecture)

---

## 1. Observation

### 1.1 Scope & Assignment Context
- Under **ORIGINAL_REQUEST.md** (Request 2026-10-12T15:06:58Z), Phase 6 mandates extracting and authoring 7 comprehensive agent skill repositories into `.agents/skills/`, including `.agents/skills/librechat/` and `.agents/skills/awesome-agent-skills/`.
- Per **PROJECT.md** (lines 29–37), Milestone 2 (M2) encompasses:
  - Feature 7: `conversational-ui-streaming` (SSE token streaming, AbortController, auto-scroll) [Assigned to Explorer M2_1]
  - Feature 8: `dynamic-artifacts-rendering` (Sandpack isolated iframe, state decoupling) [Assigned to Explorer M2_1]
  - Feature 9: `mcp-client-architecture` (stdio, SSE, streamable-http via `librechat.yaml`) [Assigned to Explorer M2_2]
  - Feature 10: `endpoint-orchestration` (custom endpoints, `dropParams` parameter stripping, model fallback chains) [Assigned to Explorer M2_2]
  - Feature 11: `multi-turn-session-persistence` (`parentMessageId` message tree DAG branching, conversation state) [Assigned to Explorer M2_2]
  - Features 12–15: `awesome-agent-skills` package layout, cross-harness matrix, catalog [Assigned to Explorer M2_3]
- As Explorer M2_2, our assigned boundary is read-only architectural investigation and concrete blueprint formulation for Features 9, 10, and 11 to empower `worker_m2`.

### 1.2 Inspection of Existing Guardrails & Repository Baseline
- **System Guardrails** (`.agents/rules/agent_skill_guardrails.md`):
  - Line 19–28: YAML Frontmatter must have `name: <kebab-case>` and folded scalar `description: >-` with explicit trigger criteria. Must NEVER include `trigger: always_on` in skills.
  - Line 53–59: File budget constraints: `<400 lines` per markdown file; `<30,000 tokens` working context. Modular decomposition into `references/` and `scripts/` when necessary.
  - Line 76–87: 100% on-device processing, zero external telemetry SDKs, zero `navigator.sendBeacon()`.
  - Line 111–139: Indonesian UU PDP No. 27/2022 Sensitive Health Data protections (Pasal 4 & 16) and Anonymous Guest Mode pseudonymization ("Calm River").
  - Line 153–174: Client-side cryptographic standard: Web Crypto AES-GCM-256 with PBKDF2 (600,000 iterations in production) and `EncryptedPayload` schema.
- **Repository Baseline Quality Gates** (from `explorer_survey_1/handoff.md`):
  - Gate 1 (`npm run lint` / `oxlint`): 0 warnings, 0 errors across 171 files.
  - Gate 2 (`npx tsc -b`): Clean compilation, exit code 0.
  - Gate 3 (`npm test` / Vitest): 65 test files, 662 tests passed, 0 failures.
  - Gate 4 (`npm run build`): Clean PWA build, 62 precached Workbox assets.

### 1.3 Verbatim Findings from LibreChat Architecture & MCP Protocol
1. **MCP (Model Context Protocol) Transport Layer**:
   - `stdio`: Child process spawned via Node.js `child_process.spawn`. Standard input (`stdin`) and standard output (`stdout`) transfer newline-delimited JSON-RPC 2.0 messages. Standard error (`stderr`) is captured for telemetry/debugging. Handshake relies on `initialize` method followed by `notifications/initialized`. Tool discovery via `tools/list`; tool execution via `tools/call`.
   - `sse`: Client initiates HTTP GET to a persistent server-sent events stream endpoint (`url`). The server transmits an initial `endpoint` event declaring the HTTP POST target for JSON-RPC messages. Responses stream back over the SSE channel.
   - `streamable-http`: Direct HTTP POST streaming transport, useful in serverless/stateless environments where persistent daemon processes or persistent SSE sockets are restricted.
2. **`librechat.yaml` Configuration Schema**:
   - Version specification: `version: 1.3.17`.
   - `mcpServers` dictionary allows defining named servers with transport types (`stdio`, `sse`, `streamable-http`), commands, args, URLs, headers, and execution timeouts (`timeout`, `initTimeout`).
   - Supports environment variable interpolation (`${VAR_NAME}`) and user context templates (`{{LIBRECHAT_USER_ID}}`).
3. **Endpoint Orchestration & `dropParams` Parameter Stripping**:
   - `endpoints.custom` defines heterogeneous LLM backends (Ollama, LM Studio, vLLM, OpenRouter, Groq, Mistral).
   - Problem: OpenAI SDK defaults include parameters (`user`, `frequency_penalty`, `presence_penalty`, `logit_bias`, `seed`, `max_tokens` vs `max_completion_tokens`). Downstream local inference engines (Ollama, vLLM) or proxy gateways enforce strict Pydantic request models and reject unrecognized fields with HTTP 422 Unprocessable Entity (`{"detail": [{"loc": ["body", "user"], "msg": "extra fields not permitted"}]}`).
   - Solution: `dropParams: string[]` specifies exact keys that LibreChat deletes from the outgoing payload before dispatching HTTP requests.
   - Separation of titling model (`titleModel`, `titleConvo: true`) ensures fast, low-cost models generate conversation titles without consuming expensive reasoning tokens.
4. **Multi-Turn Session Persistence (`parentMessageId` Message Tree DAG)**:
   - Message history is represented as a Directed Acyclic Graph (DAG) rooted at synthetic node `00000000-0000-0000-0000-000000000000`.
   - Every message has an immutable UUIDv4 `messageId` and points to its predecessor via `parentMessageId`.
   - When a user edits a prior message, a new branch node is spawned pointing to that turn's parent, leaving the original branch intact.
   - When a user regenerates an assistant response, multiple assistant nodes share the identical `parentMessageId`.
   - Linear conversation reconstruction is achieved via backward traversal from `currentMessageId` (the active leaf) up to the root.

---

## 2. Logic Chain

### 2.1 Deductive Formulation: LibreChat MCP Client Architecture
- **Premise 1**: Autonomous agents need tool execution capabilities without tight coupling to a single proprietary runtime.
- **Premise 2**: MCP standardizes tool definitions as JSON Schema via JSON-RPC 2.0 over `stdio`, `sse`, or `streamable-http`.
- **Deduction 1 (Lifecycle)**: The MCP integration engine in LibreChat must follow a strict 4-phase lifecycle:
  1. *Handshake Phase*: Client sends `initialize` (capabilities, protocol version) -> Server returns capabilities (`tools`, `resources`, `prompts`) -> Client sends `notifications/initialized`.
  2. *Tool Discovery Phase*: Client calls `tools/list` -> Server returns tool definitions with JSON Schema parameter definitions.
  3. *Dynamic Schema Registration*: Client maps MCP tools into standard OpenAI/Anthropic tool schemas, prefixing tool names with the server namespace (`${serverName}__${toolName}`) to eliminate collision risks across multiple servers.
  4. *Dispatch & Execution Phase*: LLM generates tool call -> Dispatcher parses server and tool identifier -> Dispatches `tools/call` JSON-RPC over the active transport -> Wraps output into tool message role -> Feeds back to LLM context.
- **Deduction 2 (Resilience & Watchdog)**: If an stdio child process hangs or crashes, or an SSE socket drops, the client must employ an `initTimeout` (default: 15,000 ms) and tool execution `timeout` (default: 60,000 ms) watchdog, returning a graceful error to the LLM rather than terminating the session.

### 2.2 Deductive Formulation: Custom Endpoints & `dropParams` Parameter Stripping
- **Premise 1**: Different LLM providers implement divergent subsets of the OpenAI Chat Completions API.
- **Premise 2**: Pydantic/FastAPI backends (Ollama, LM Studio, vLLM) crash with HTTP 422 if unexpected keys like `user`, `frequency_penalty`, or `seed` are included.
- **Premise 3**: Newer reasoning models (OpenAI o1, o3-mini) reject `max_tokens` in favor of `max_completion_tokens`, while older engines reject `max_completion_tokens`.
- **Deduction 1 (`dropParams`)**: A parameter stripping filter is mandatory. Before dispatching requests, the endpoint adapter must iterate over `endpoint.dropParams` and prune those keys from the request payload.
- **Deduction 2 (Fallback & Titling)**: Endpoints should support automatic model fallback chains (e.g., Local Ollama -> Fallback Cloud Proxy) and dedicated titling models (`titleModel`) to prevent latency spikes during initial turn auto-titling.

### 2.3 Deductive Formulation: Multi-Turn Session Persistence (`parentMessageId` DAG Tree)
- **Premise 1**: A flat message list (`Message[]`) cannot support non-destructive message edits or multi-variant regenerations.
- **Premise 2**: Real-world conversational workflows require users to edit past prompts or regenerate responses without losing previous conversational threads.
- **Deduction 1 (Data Model)**: Each message must be an immutable node with `messageId`, `parentMessageId`, `conversationId`, and timestamp. The root message references `parentMessageId: "00000000-0000-0000-0000-000000000000"`.
- **Deduction 2 (Backward Traversal Algorithm)**:
  - Input: `currentMessageId` (active leaf node) and a message map indexed by `messageId`.
  - Traverse backwards: `curr = currentMessageId`; while `curr !== ROOT_ID` and `curr !== null`, append to linear list, set `curr = msg.parentMessageId`. Reverse the list.
  - Cycle Detection: Track visited IDs in a `Set<string>`. If an already visited ID is encountered, abort traversal and return the recovered branch to prevent infinite loops.
  - Orphan Recovery: If a `parentMessageId` is missing from the local store, terminate at that node and treat it as the provisional root.
- **Deduction 3 (Forward Branch Rendering)**:
  - Group messages by `parentMessageId` into a `Map<string, string[]>`.
  - For any message node $N$ with parent $P$, the index in `childrenMap.get(P)` yields the branch variant number (e.g., variant 2 of 3), enabling intuitive `< 2 / 3 >` pagination controls in the UI.

### 2.4 Alignment with RIMA Guardrails & Offline-First Privacy
- **Privacy & Encryption**: In RIMA, therapeutic chat sessions (Yale Mood Meter reflections, CBT thought diaries, crisis chats) are classified as *Data Pribadi Spesifik* under UU PDP No. 27/2022.
- When persisting the conversation DAG to IndexedDB (`rima-offline-db`) or `localStorage`, the message text and artifacts must be stored as an `EncryptedPayload` using Web Crypto `AES-GCM-256` with PBKDF2 (600,000 iterations).
- **Line Limit (<400 Lines)**: The target skill `.agents/skills/librechat/SKILL.md` must be lean, structured, and modular. Heavy reference tables, full JSON schemas, and code implementations should be packaged cleanly within the skill file and referenced modules to keep every individual file strictly under 400 lines.

---

## 3. Caveats

1. **Child Process Execution in Windows vs POSIX**:
   - In LibreChat `stdio` MCP configurations on Windows (the current host environment), invoking CLI commands like `npx` often requires setting `shell: true` in `child_process.spawn` or referencing `npx.cmd` to avoid `ENOENT` errors.
2. **SSE Connection Lifecycles**:
   - SSE streams in browser environments rely on `EventSource` (or `fetch` with readable streams for custom headers). Standard `EventSource` does not support custom headers (`Authorization`, `X-Client-ID`). LibreChat uses a custom `fetch`-based SSE client to support header injection.
3. **DAG Traversal Deep Recursion**:
   - While conversations rarely exceed thousands of turns, backward traversal must use an iterative loop rather than unbounded recursion to avoid JavaScript call-stack overflows.
4. **Memory Consumption with Large Artifacts**:
   - When conversation branches store large generative artifacts (e.g., Sandpack code bundles, SVG diagrams), storing complete copies in every branch node increases memory. State decoupling and artifact deduplication by content hash should be recommended.

---

## 4. Conclusion & Concrete Blueprint for Worker M2

### 4.1 Specification for `.agents/skills/librechat/SKILL.md`

#### A. YAML Frontmatter Schema
```yaml
---
name: librechat
description: >-
  Conversational UI architecture, Model Context Protocol (MCP) tool integration
  (stdio, SSE, streamable-http), custom endpoint orchestration with dropParams
  parameter stripping, generative Sandpack artifacts rendering, and multi-turn
  session persistence using parentMessageId message tree DAG branching. Use when
  authoring, auditing, or configuring conversational AI harnesses, tool calling
  protocols, or resilient chat session persistence.
license: MIT
metadata:
  category: conversational-ai-architecture
  upstream: https://github.com/danny-avila/LibreChat
---
```

#### B. Architectural Modules Overview
The skill `.agents/skills/librechat/SKILL.md` must be organized into 5 concrete operational playbooks:
1. **Playbook 1: Conversational UI & Streaming Loop** (SSE tokens, AbortController, auto-scroll with user override).
2. **Playbook 2: Dynamic Artifacts & Sandpack Isolated Execution** (Sandpack iframe, postMessage, fallback rendering).
3. **Playbook 3: Model Context Protocol (MCP) Integration Engine** (stdio/SSE/streamable-http transports, `librechat.yaml` schema, dynamic tool registration, timeout watchdogs).
4. **Playbook 4: Custom Endpoint Orchestration & `dropParams` Stripping** (Ollama/vLLM/OpenRouter routing, HTTP 422 parameter stripping, model fallback chains, titling model separation).
5. **Playbook 5: Multi-Turn Session Persistence (`parentMessageId` Tree DAG)** (tree DAG data structure, backward traversal, branch pagination, cycle & orphan defense, Web Crypto E2EE storage).

---

### 4.2 Production `librechat.yaml` Configuration Blueprint
Here is the exact production-ready `librechat.yaml` configuration schema for Worker M2:

```yaml
version: 1.3.17

cache: true

# MCP (Model Context Protocol) Server Integration
mcpServers:
  # 1. Local Process stdio Transport
  filesystem:
    type: stdio
    command: npx
    args:
      - -y
      - '@modelcontextprotocol/server-filesystem'
      - 'c:/Users/Hype/Kuliah/Proyekan/mental monitoring'
    timeout: 60000
    initTimeout: 15000
    serverInstructions: 'Operate strictly inside workspace boundaries. Never delete files without explicit user confirmation.'

  # 2. Remote Server SSE Transport with Auth Headers
  rima_somatics:
    type: sse
    url: http://localhost:8080/mcp/sse
    headers:
      X-Client-ID: '{{LIBRECHAT_USER_ID}}'
      Authorization: 'Bearer ${RIMA_INTERNAL_SECRET}'
    timeout: 30000
    initTimeout: 10000
    serverInstructions: 'Provides local Web Audio somatics parameters and grounding exercise steps.'

  # 3. Streamable HTTP Transport (Serverless / Scalable)
  cloud_tools:
    type: streamable-http
    url: https://tools.internal.net/mcp/stream
    headers:
      Authorization: 'Bearer ${TOOLS_API_KEY}'
    timeout: 45000
    disabled: false

# Custom Endpoints & Parameter Normalization
endpoints:
  custom:
    # Local Ollama Inference (Requires dropParams to prevent HTTP 422)
    - name: 'LocalOllama'
      apiKey: 'ollama'
      baseURL: 'http://localhost:11434/v1'
      models:
        default: ['llama3.2', 'qwen2.5-coder']
        fetch: true
      titleConvo: true
      titleModel: 'llama3.2'
      titleMethod: 'completion'
      modelDisplayLabel: 'Ollama Local (Offline)'
      dropParams:
        - 'user'
        - 'frequency_penalty'
        - 'presence_penalty'
        - 'logit_bias'
        - 'seed'
      headers:
        X-Local-Routing: 'true'

    # OpenRouter Multi-Model Cloud Fallback
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_API_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['anthropic/claude-3.5-haiku', 'meta-llama/llama-3.2-3b-instruct']
        fetch: false
      titleConvo: true
      titleModel: 'anthropic/claude-3.5-haiku'
      modelDisplayLabel: 'OpenRouter Gateway'
      dropParams:
        - 'user'
      headers:
        HTTP-Referer: 'https://rima.local'
        X-Title: 'RIMA Conversational Core'
```

---

### 4.3 Reference Implementation: MCP Dynamic Tool Registration & Dispatcher
Below is the reference TypeScript implementation for the MCP Dispatcher:

```typescript
/**
 * MCP Tool Dispatcher & Schema Transformer
 */
export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface OpenAiToolSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export class McpToolManager {
  private registeredTools: Map<string, { serverName: string; originalName: string }> = new Map();

  /**
   * Registers tools from an MCP server, applying namespace separation
   * Format: `${serverName}__${toolName}`
   */
  public registerServerTools(serverName: string, tools: McpToolDefinition[]): OpenAiToolSchema[] {
    const schemas: OpenAiToolSchema[] = [];

    for (const tool of tools) {
      const namespacedName = `${serverName}__${tool.name}`;
      this.registeredTools.set(namespacedName, {
        serverName,
        originalName: tool.name,
      });

      schemas.push({
        type: 'function',
        function: {
          name: namespacedName,
          description: `[Server: ${serverName}] ${tool.description}`,
          parameters: tool.inputSchema,
        },
      });
    }

    return schemas;
  }

  /**
   * Resolves a namespaced tool call back to server name and original tool name
   */
  public resolveToolCall(namespacedName: string): { serverName: string; toolName: string } {
    const registered = this.registeredTools.get(namespacedName);
    if (!registered) {
      // Fallback: parse via separator
      const parts = namespacedName.split('__');
      if (parts.length >= 2) {
        return { serverName: parts[0], toolName: parts.slice(1).join('__') };
      }
      throw new Error(`Unregistered tool: ${namespacedName}`);
    }
    return { serverName: registered.serverName, toolName: registered.originalName };
  }

  /**
   * Executes tool with timeout watchdog
   */
  public async executeWithWatchdog<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    toolName: string
  ): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`MCP Tool '${toolName}' execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([operation(), timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
```

---

### 4.4 Reference Implementation: Custom Endpoint Parameter Sanitizer & Fallback
Below is the reference TypeScript implementation for parameter stripping:

```typescript
/**
 * Custom Endpoint Parameter Sanitizer
 * Strips unsupported parameters to prevent HTTP 422 Unprocessable Entity
 */
export interface CustomEndpointConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  dropParams?: string[];
  headers?: Record<string, string>;
}

export function sanitizeRequestPayload(
  payload: Record<string, unknown>,
  dropParams?: string[]
): Record<string, unknown> {
  if (!dropParams || dropParams.length === 0) {
    return { ...payload };
  }

  const sanitized: Record<string, unknown> = {};
  const dropSet = new Set(dropParams);

  for (const [key, value] of Object.entries(payload)) {
    if (!dropSet.has(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Defensive HTTP 422 Auto-Recovery Handler
 */
export async function executeCompletionsWithRetry(
  endpoint: CustomEndpointConfig,
  rawPayload: Record<string, unknown>,
  fetcher: (url: string, init: RequestInit) => Promise<Response>
): Promise<Response> {
  let payload = sanitizeRequestPayload(rawPayload, endpoint.dropParams);

  let response = await fetcher(`${endpoint.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${endpoint.apiKey}`,
      ...(endpoint.headers || {}),
    },
    body: JSON.stringify(payload),
  });

  // If HTTP 422 Unprocessable Entity, attempt emergency extra parameter stripping
  if (response.status === 422) {
    try {
      const errorJson = await response.clone().json();
      // Look for Pydantic extra field errors: [{"loc": ["body", "param_name"]}]
      if (Array.isArray(errorJson.detail)) {
        const extraFields: string[] = errorJson.detail
          .filter((d: { msg?: string; loc?: string[] }) => d.loc && d.loc[0] === 'body')
          .map((d: { loc: string[] }) => d.loc[1])
          .filter(Boolean);

        if (extraFields.length > 0) {
          payload = sanitizeRequestPayload(payload, extraFields);
          response = await fetcher(`${endpoint.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${endpoint.apiKey}`,
              ...(endpoint.headers || {}),
            },
            body: JSON.stringify(payload),
          });
        }
      }
    } catch {
      // Return original response if parsing fails
    }
  }

  return response;
}
```

---

### 4.5 Reference Implementation: Conversation Tree DAG Engine
Below is the reference TypeScript implementation for multi-turn session persistence:

```typescript
/**
 * LibreChat Conversation Tree DAG Session Engine
 */
export interface ConversationRecord {
  conversationId: string;
  title: string;
  user: string;
  endpoint: string;
  model: string;
  currentMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  messageId: string;
  conversationId: string;
  parentMessageId: string; // "00000000-0000-0000-0000-000000000000" if root
  sender: 'User' | 'Assistant' | 'System';
  text: string;
  isCreatedByUser: boolean;
  error?: boolean;
  unfinished?: boolean;
  artifacts?: Array<{
    identifier: string;
    type: string;
    title: string;
    content: string;
  }>;
  createdAt: string;
}

export const ROOT_MESSAGE_ID = '00000000-0000-0000-0000-000000000000';

export class ConversationDagEngine {
  /**
   * Reconstructs the linear conversation branch leading to leafMessageId
   * Traverses backward from leaf to root, detecting cycles and orphaned nodes.
   */
  public static getActiveBranch(
    messagesMap: Map<string, MessageRecord>,
    leafMessageId: string
  ): MessageRecord[] {
    const branch: MessageRecord[] = [];
    let currId: string | null = leafMessageId;
    const visited = new Set<string>();

    while (currId && currId !== ROOT_MESSAGE_ID) {
      if (visited.has(currId)) {
        // Cycle detected: halt traversal safely
        break;
      }
      visited.add(currId);

      const msg = messagesMap.get(currId);
      if (!msg) {
        // Orphaned node encountered: stop at broken link
        break;
      }

      branch.unshift(msg); // Prepend to preserve chronological order
      currId = msg.parentMessageId;
    }

    return branch;
  }

  /**
   * Builds the forward children index for branch switcher pagination
   * parentId -> [childId1, childId2, ...]
   */
  public static buildChildrenIndex(messages: MessageRecord[]): Map<string, string[]> {
    const index = new Map<string, string[]>();

    for (const msg of messages) {
      const parentId = msg.parentMessageId;
      const children = index.get(parentId) || [];
      children.push(msg.messageId);
      index.set(parentId, children);
    }

    return index;
  }

  /**
   * Calculates pagination info for a message among its siblings:
   * e.g., variant 2 of 3
   */
  public static getBranchVariantInfo(
    childrenIndex: Map<string, string[]>,
    message: MessageRecord
  ): { index: number; total: number; siblingIds: string[] } {
    const siblings = childrenIndex.get(message.parentMessageId) || [message.messageId];
    const idx = siblings.indexOf(message.messageId);
    return {
      index: idx >= 0 ? idx + 1 : 1,
      total: siblings.length,
      siblingIds: siblings,
    };
  }

  /**
   * Creates a new branched message for edits or regenerations
   */
  public static createBranchNode(
    conversationId: string,
    parentMessageId: string,
    sender: 'User' | 'Assistant',
    text: string,
    generateId: () => string
  ): MessageRecord {
    return {
      messageId: generateId(),
      conversationId,
      parentMessageId,
      sender,
      text,
      isCreatedByUser: sender === 'User',
      createdAt: new Date().toISOString(),
    };
  }
}
```

---

## 5. Verification Method

### 5.1 Verification Commands for Worker M2
To independently verify implementation of `.agents/skills/librechat/SKILL.md`:

```bash
# 1. Frontmatter Schema Verification
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/librechat/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter open delimiter');
const parts = content.split('---');
if (parts.length < 3) throw new Error('Malformed frontmatter delimiters');
const yaml = parts[1];
if (!/name:\s*librechat/.test(yaml)) throw new Error('Missing name: librechat');
if (!/description:\s*.+/.test(yaml)) throw new Error('Missing description field');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Skills must NOT declare trigger: always_on');
console.log('PASS: LibreChat SKILL.md frontmatter is valid.');
"

# 2. Line Limit Budget Verification (< 400 lines)
node -e "
const fs = require('fs');
const lines = fs.readFileSync('.agents/skills/librechat/SKILL.md', 'utf8').split('\n').length;
if (lines >= 400) throw new Error('SKILL.md exceeds 400 lines threshold: ' + lines);
console.log('PASS: LibreChat SKILL.md line count is within budget: ' + lines + ' lines (budget: < 400).');
"

# 3. 4 Quality Gates Preservation Check
npm run lint
npx tsc -b
npm test
npm run build
```

### 5.2 Invalidation Conditions
This investigation report is invalidated if:
1. LibreChat deprecates `parentMessageId` in favor of a graph database format with incompatible relational properties.
2. The Model Context Protocol (MCP) removes JSON-RPC 2.0 framing or discontinues `stdio`/`sse` transports.
3. Adding `.agents/skills/librechat/` triggers any regression in RIMA's 4 Quality Gates (`oxlint`, `tsc -b`, `vitest`, or `vite build`).

---
*Report authored by Explorer M2_2 (`explorer_m2_2`). Ready for handover to Orchestrator and Worker M2.*
