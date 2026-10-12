---
name: librechat
description: >-
  Conversational UI streaming loop, Server-Sent Events (SSE) token accumulation,
  AbortController cancellation with partial state preservation, user-override auto-scroll,
  isolated iframe Sandpack dynamic artifacts rendering, Model Context Protocol (MCP)
  client architecture (stdio, SSE, streamable-http), custom endpoint orchestration with
  dropParams parameter stripping, and multi-turn session persistence using parentMessageId
  tree DAG branching. Use when implementing or auditing streaming chat interfaces, generative
  UI artifact sandboxes, MCP tool integrations, or branching conversation histories.
license: Apache-2.0
metadata:
  category: conversational-ui-and-agent-architecture
  upstream: https://github.com/danny-avila/LibreChat
---

# LibreChat Conversational UI & Agent Architecture Skill

This skill provides production standard operating procedures (SOPs), schemas, and architectural patterns derived from LibreChat for conversational interfaces, dynamic artifact sandboxes, Model Context Protocol (MCP) client runtimes, parameter-normalized endpoint orchestration, and tree DAG conversation persistence.

---

## 1. Conversational UI Streaming Loop & Auto-Scroll Engine

### 1.1 Server-Sent Events (SSE) Transport & Token Accumulator
LLM completions emit fragmented TCP chunks. The client-side consumer must decode UTF-8 byte streams safely, maintain an event buffer, split strictly on `\n\n` event boundaries, and accumulate incremental token deltas.

```typescript
export interface StreamingChunkOptions {
  url: string;
  payload: Record<string, unknown>;
  signal: AbortSignal;
  onToken: (delta: string) => void;
  onToolCall?: (toolCall: { id: string; name: string; args: string }) => void;
  onError: (error: { code: string; message: string }) => void;
  onFinal: (finalData: { messageId: string; text: string; usage?: unknown }) => void;
}

export async function executeStreamingLoop(options: StreamingChunkOptions): Promise<void> {
  const { url, payload, signal, onToken, onToolCall, onError, onFinal } = options;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => 'Network response error');
    onError({ code: `HTTP_${response.status}`, message: errorText });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { stream: true });
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? ''; // Retain trailing uncompleted chunk

      for (const eventBlock of events) {
        const trimmed = eventBlock.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // Skip keep-alives

        let eventType = 'message';
        let dataStr = '';
        for (const line of trimmed.split('\n')) {
          if (line.startsWith('event:')) eventType = line.slice(6).trim();
          else if (line.startsWith('data:')) dataStr = line.slice(5).trim();
        }
        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (eventType === 'message' && typeof parsed.text === 'string') onToken(parsed.text);
          else if (eventType === 'tool_call' && onToolCall) onToolCall(parsed);
          else if (eventType === 'error') onError(parsed);
          else if (eventType === 'final') onFinal(parsed);
        } catch {
          if (eventType === 'message') onToken(dataStr);
        }
      }
    }
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError' || signal.aborted) return;
    onError({ code: 'STREAM_READ_ERROR', message: (err as Error)?.message ?? 'Stream failure' });
  } finally {
    reader.releaseLock();
  }
}
```

### 1.2 AbortController Cancellation & Partial State Preservation
When the user halts generation, aborting must **never** discard accumulated tokens:
1. Trigger `AbortController.abort()`.
2. Transition message status: `STREAMING` $\rightarrow$ `ABORTED`.
3. Retain the accumulated response in the state tree marked with `unfinished: true`.
4. Surface an inline status indicator badge (`[Dihentikan oleh pengguna]`) without throwing runtime unhandled exceptions.

### 1.3 User-Override Auto-Scroll UX Engine
Rapid token rendering causes frequent viewport resizing. If a user scrolls up to review prior clinical advice, forcing scroll to bottom causes disorientation:
- Calculate $\Delta_{\text{bottom}} = \text{scrollHeight} - \text{scrollTop} - \text{clientHeight}$.
- If $\Delta_{\text{bottom}} > 80\text{px}$, engage `isUserScrolledUp = true` and pause automatic scrolling.
- Display a floating "Scroll to bottom" button with an active streaming pulse dot.
- If $\Delta_{\text{bottom}} \le 15\text{px}$ or user clicks the button, re-engage automated tracking (`isUserScrolledUp = false`).

---

## 2. Dynamic Artifacts (Generative UI) Sandbox & State Decoupling

### 2.1 Artifact Delimiter Specification
The assistant formats self-contained components in structured XML blocks:
```xml
<librechat_artifact identifier="cbti-sleep-efficiency" type="application/vnd.react" title="Kalkulator Efisiensi Tidur CBT-I">
import React, { useState } from 'react';
export default function SleepCalculator() {
  const [tst, setTst] = useState(6.5);
  const [tib, setTib] = useState(8.0);
  const efficiency = Math.round((tst / tib) * 100);
  return <div style={{ padding: '1rem' }}>Efisiensi Tidur: {efficiency}%</div>;
}
</librechat_artifact>
```

### 2.2 Isolated Iframe Sandbox Architecture
Dynamic code runs within a fortified `iframe` to prevent DOM clobbering, CSS bleeding, or script injection:
- Sandboxing: `sandbox="allow-scripts allow-forms allow-same-origin allow-modals"`.
- Omit `allow-top-navigation` and `allow-popups-to-escape-sandbox`.
- Restrictive Content Security Policy:
  ```http
  default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none';
  ```
- **Air-Gapped / Offline Fallback**: Under 100% on-device or offline mode, avoid external CDN bundlers (`codesandbox.io`, `unpkg.com`). Render interactive HTML snippets via `srcdoc` or provide an offline syntax-highlighted preview with copy/export actions.

### 2.3 Typed Bidirectional PostMessage Bridge
```typescript
export type HostToSandboxMessage =
  | { type: 'RENDER_ARTIFACT'; identifier: string; code: string; theme: 'light' | 'dark' }
  | { type: 'RESET_STATE' };

export type SandboxToHostMessage =
  | { type: 'SANDBOX_READY' }
  | { type: 'CONSOLE_LOG'; level: 'log' | 'info' | 'warn' | 'error'; args: string[] }
  | { type: 'RUNTIME_ERROR'; message: string; line?: number }
  | { type: 'CONTENT_RESIZE'; height: number };
```

### 2.4 Decoupled State & Multi-Version Artifact Store
Decouple artifacts from conversational message bubbles into an `ArtifactStore` indexed by `identifier`. Successive edits append versions (`v1`, `v2`, `v3`), enabling forward/backward revision switching without duplicating history nodes.

---

## 3. Model Context Protocol (MCP) Client Architecture

### 3.1 Transport Protocol Matrix
| Transport Type | Protocol / Medium | Use Case & Lifecycle |
|:---|:---|:---|
| `stdio` | Local process stdin/stdout via JSON-RPC 2.0 | Local CLI tools, filesystem access, local CLI tools (Node/Python). |
| `sse` | Persistent HTTP Server-Sent Events | Long-running microservices, remote agent servers, authenticated endpoints. |
| `streamable-http` | Streaming HTTP POST requests | Serverless deployments, edge workers, and stateless backends. |

### 3.2 Production `librechat.yaml` Configuration Schema
```yaml
version: 1.3.17
cache: true

mcpServers:
  filesystem:
    type: stdio
    command: npx
    args:
      - -y
      - '@modelcontextprotocol/server-filesystem'
      - 'c:/Users/Hype/Kuliah/Proyekan/mental monitoring'
    timeout: 60000
    initTimeout: 15000
    serverInstructions: 'Operate strictly inside workspace boundaries. Never delete files without confirmation.'

  rima_somatics:
    type: sse
    url: http://localhost:8080/mcp/sse
    headers:
      X-Client-ID: '{{LIBRECHAT_USER_ID}}'
      Authorization: 'Bearer ${RIMA_INTERNAL_SECRET}'
    timeout: 30000
    initTimeout: 10000
    serverInstructions: 'Provides local Web Audio somatics parameters and grounding exercises.'

  cloud_tools:
    type: streamable-http
    url: https://tools.internal.net/mcp/stream
    headers:
      Authorization: 'Bearer ${TOOLS_API_KEY}'
    timeout: 45000
    disabled: false
```

### 3.3 Dynamic Tool Registration & Namespacing
To prevent tool naming collisions across multiple MCP servers, tools are registered using namespacing:
$$\text{NamespacedToolName} = \text{\$\{serverName\}\_\_\$\{toolName\}}$$

```typescript
export class McpToolManager {
  private registry = new Map<string, { serverName: string; originalName: string }>();

  public registerTools(serverName: string, tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>) {
    return tools.map((tool) => {
      const namespaced = `${serverName}__${tool.name}`;
      this.registry.set(namespaced, { serverName, originalName: tool.name });
      return {
        type: 'function' as const,
        function: {
          name: namespaced,
          description: `[${serverName}] ${tool.description}`,
          parameters: tool.inputSchema,
        },
      };
    });
  }

  public resolveTool(namespacedName: string) {
    const entry = this.registry.get(namespacedName);
    if (!entry) throw new Error(`Unregistered MCP tool: ${namespacedName}`);
    return entry;
  }
}
```

### 3.4 Execution Watchdog & Timeout Safeguards
Wrap tool execution in an execution watchdog (`Promise.race` against `timeout` timer) to terminate stalled child processes or hanging remote sockets without locking the conversational UI.

---

## 4. Custom Endpoint Orchestration & `dropParams` Parameter Stripping

### 4.1 Heterogeneous Model Routing & Parameter Normalization
Different LLM engines enforce strict Pydantic models. Passing standard OpenAI parameters (e.g., `user`, `frequency_penalty`, `seed`, `logit_bias`) to local engines (Ollama, vLLM, LM Studio) triggers **HTTP 422 Unprocessable Entity**.

LibreChat enforces `dropParams` parameter stripping prior to network dispatch:
```typescript
export function sanitizeRequestPayload(
  payload: Record<string, unknown>,
  dropParams?: string[]
): Record<string, unknown> {
  if (!dropParams || dropParams.length === 0) return { ...payload };
  const sanitized = { ...payload };
  for (const param of dropParams) {
    delete sanitized[param];
  }
  return sanitized;
}
```

### 4.2 Endpoint Orchestration Configuration
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
      modelDisplayLabel: 'Ollama Local (Offline)'
      dropParams:
        - 'user'
        - 'frequency_penalty'
        - 'presence_penalty'
        - 'logit_bias'
        - 'seed'

    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_API_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['anthropic/claude-3.5-haiku']
      titleConvo: true
      titleModel: 'anthropic/claude-3.5-haiku'
      dropParams:
        - 'user'
```

### 4.3 Titling Model Separation & Fallback Chains
- **Titling Model Separation**: Run a lightweight, fast model (`titleModel`) for initial conversation titling (`titleConvo: true`) to avoid wasting high-latency reasoning tokens.
- **Defensive Fallback Chains**: If local inference is unreachable or returns HTTP 503, failover transparently to a secondary endpoint or inform the user with actionable diagnostics.

---

## 5. Multi-Turn Session Persistence (`parentMessageId` Message Tree DAG)

### 5.1 Tree DAG Data Model
Linear arrays cannot support non-destructive prompt edits or multiple regenerated responses. LibreChat organizes messages into a Directed Acyclic Graph (DAG) rooted at synthetic node `00000000-0000-0000-0000-000000000000`.

```typescript
export const ROOT_MESSAGE_ID = '00000000-0000-0000-0000-000000000000';

export interface MessageNode {
  messageId: string;
  conversationId: string;
  parentMessageId: string;
  sender: 'User' | 'Assistant' | 'System';
  text: string;
  isCreatedByUser: boolean;
  unfinished?: boolean;
  createdAt: string;
}
```

### 5.2 Backward Traversal Algorithm with Cycle & Orphan Protection
Given the active leaf `currentMessageId`, reconstruct the linear conversation thread via backward traversal:
```typescript
export function reconstructActiveThread(
  messagesMap: Map<string, MessageNode>,
  leafMessageId: string
): MessageNode[] {
  const thread: MessageNode[] = [];
  let currentId: string | null = leafMessageId;
  const visited = new Set<string>();

  while (currentId && currentId !== ROOT_MESSAGE_ID) {
    if (visited.has(currentId)) break; // Cycle detected: abort safely
    visited.add(currentId);

    const node = messagesMap.get(currentId);
    if (!node) break; // Orphaned node: terminate traversal at broken link

    thread.unshift(node); // Prepend to preserve chronological sequence
    currentId = node.parentMessageId;
  }
  return thread;
}
```

### 5.3 Forward Children Index & Branch Pagination
Construct a forward map from `parentMessageId` to children to enable `< 2 / 3 >` branch switcher pagination in the UI:
```typescript
export function buildBranchIndex(messages: MessageNode[]): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const msg of messages) {
    const siblings = index.get(msg.parentMessageId) || [];
    siblings.push(msg.messageId);
    index.set(msg.parentMessageId, siblings);
  }
  return index;
}

export function getBranchPagination(index: Map<string, string[]>, node: MessageNode) {
  const siblings = index.get(node.parentMessageId) || [node.messageId];
  const position = siblings.indexOf(node.messageId);
  return {
    current: position >= 0 ? position + 1 : 1,
    total: siblings.length,
    siblingIds: siblings,
  };
}
```

### 5.4 Privacy & Cryptographic Persistence (Indonesian UU PDP No. 27/2022)
In RIMA, conversational logs and emotional self-reflection entries are classified as **Data Pribadi Spesifik** under UU PDP No. 27/2022 Pasal 4 & 16:
- Never persist plaintext conversation DAG nodes to remote servers or shared unpartitioned storage.
- When committing to IndexedDB (`rima-offline-db`) or `localStorage`, encrypt message contents using Web Crypto `AES-GCM-256` with PBKDF2 (600,000 iterations in production) conforming to the `EncryptedPayload` schema.
- Support 1-tap complete data erasure (`wipeAllUserData()`) per Pasal 8 UU PDP No. 27/2022.

## 6. Verification Runbook

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/librechat/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*librechat/.test(yaml)) throw new Error('Missing name: librechat');
if (!/license:\s*Apache-2.0/.test(yaml)) throw new Error('Missing license: Apache-2.0');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Skills must not declare trigger: always_on');
const lineCount = content.split('\n').length;
if (lineCount >= 400) throw new Error('Line count exceeds 400 lines: ' + lineCount);
console.log('PASS: librechat SKILL.md compliant (' + lineCount + ' lines).');
"
```
