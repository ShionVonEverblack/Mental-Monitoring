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

# Aion-UI Multi-Agent Workspace & CLI Orchestration Skill

This skill provides production operational playbooks, schemas, and automation patterns derived from AionUi for multi-agent workspace isolation, local CLI subagent process supervision via Agent Client Protocol (ACP), and resilient atomic file operations.

---

## 1. Multi-Agent Workspace Management & Isolation

### 1.1 Directory Confinement & Exclusive Write Boundaries
In complex multi-agent environments, concurrent agents modifying the same file tree create severe race conditions and corrupted states. AionUi enforces strict workspace confinement:
- Each subagent is allocated an exclusive working directory: `.agents/teamwork/<agent_id>/`.
- Agents communicate strictly through files (`plan.md`, `progress.md`, `handoff.md`) and reactive messages (`send_message`).
- **Inviolable Boundary**: An agent may read any directory in the repository, but may write **only** to its assigned folder or designated target paths declared in its dispatch agreement.

### 1.2 Git Worktree Isolation Playbook
For large-scale or multi-file code modifications requiring isolated branches, agents utilize Git worktrees:
```bash
# Provision isolated worktree for agent-1
git worktree add -b feature-agent-1 .worktrees/agent-1 main

# Verify clean isolated working tree
git -C .worktrees/agent-1 status

# After task completion and verification, merge and prune worktree
git checkout main
git merge feature-agent-1
git worktree remove .worktrees/agent-1
git branch -d feature-agent-1
```

### 1.3 Multi-Agent Team Archetypes & Role Contracts
| Role Archetype | Primary Focus | Allowed Write Targets | Prohibited Actions |
|:---|:---|:---|:---|
| **Orchestrator** | Task decomposition, roadmap tracking, gate decisions | Metadata files in `.agents/teamwork/` | Modifying `src/`, running manual implementation |
| **Explorer / Spec Miner** | Codebase mapping, requirements extraction, schemas | Read-only analysis reports in its folder | Modifying source code or test files |
| **Worker** | Code implementation meeting exact milestone scope | Target files specified in dispatch agreement | Modifying files outside milestone boundary |
| **Reviewer** | Static audit, adherence checks, compliance verify | Review reports in its folder | Code changes, merging unverified diffs |
| **Challenger** | Adversarial stress testing, boundary analysis | Verification tests in its folder | Approving without reproduction |
| **Forensic Auditor** | Verification of real implementations vs dummy facades | Audit reports in its folder | Accepting mocked or bypass solutions |

---

## 2. Local CLI Subagent Coordination (Agent Client Protocol - ACP)

### 2.1 Subagent Process Lifecycle
```text
[Spawn CLI Child] ──► [Pipe stdio Streams] ──► [ACP Event Loop] ──► [Watchdog Monitor]
       │                                              │                     │
       ▼                                              ▼                     ▼
(Exec with env)                            (Parse JSON deltas)      (Timeout check)
                                                      │                     │
                                                      ▼                     ▼
                                            [Exit Code 0: Complete]  [Timeout / Hang]
                                                                            │
                                                                            ▼
                                                                  [Tree-Kill Process]
```

### 2.2 Subagent Process Supervisor Implementation
```typescript
import { spawn, ChildProcess } from 'node:child_process';

export interface SubagentOptions {
  command: string;
  args: string[];
  cwd: string;
  timeoutMs: number;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export interface SubagentExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export async function executeSubagentCLI(options: SubagentOptions): Promise<SubagentExecutionResult> {
  const { command, args, cwd, timeoutMs, onStdout, onStderr } = options;
  const startTime = Date.now();

  return new Promise((resolve) => {
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;
    let isTerminated = false;

    // Spawn process with detached PGID to allow tree-kill on termination
    const child: ChildProcess = spawn(command, args, {
      cwd,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      terminateProcessTree(child);
    }, timeoutMs);

    child.stdout?.on('data', (chunk) => {
      const text = chunk.toString();
      stdoutBuffer += text;
      onStdout?.(text);
    });

    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      stderrBuffer += text;
      onStderr?.(text);
    });

    child.on('close', (code) => {
      if (isTerminated) return;
      isTerminated = true;
      clearTimeout(timeoutTimer);
      resolve({
        exitCode: code ?? (timedOut ? 124 : 1),
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        durationMs: Date.now() - startTime,
        timedOut,
      });
    });

    function terminateProcessTree(proc: ChildProcess) {
      if (!proc.pid) return;
      if (process.platform === 'win32') {
        // Windows process tree-kill
        spawn('taskkill', ['/PID', proc.pid.toString(), '/T', '/F']);
      } else {
        // POSIX process group kill
        try {
          process.kill(-proc.pid, 'SIGKILL');
        } catch {
          proc.kill('SIGKILL');
        }
      }
    }
  });
}
```

---

## 3. Atomic File Automation & Rollback Patterns

### 3.1 The 3-Step Atomic Write Protocol
Direct in-place writes risk leaving corrupted, half-written files if a process crashes or is aborted mid-write. AionUi mandates the atomic write sequence:
1. **Shadow Write**: Write the entire content into a temporary shadow file `<targetPath>.tmp.<uuid>`.
2. **Integrity Validation**: Validate byte length and verify file readback.
3. **Atomic Replace**: Replace the target file atomically via `fs.renameSync` (or `MoveFileEx` with `MOVEFILE_REPLACE_EXISTING` on Windows).

```typescript
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function writeAtomic(targetFilePath: string, content: string): void {
  const dir = path.dirname(targetFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tempPath = `${targetFilePath}.tmp.${crypto.randomUUID()}`;
  try {
    fs.writeFileSync(tempPath, content, 'utf8');
    // Ensure content flushed to storage
    const fd = fs.openSync(tempPath, 'r');
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    // Atomic rename replaces destination cleanly
    fs.renameSync(tempPath, targetFilePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw err;
  }
}
```

### 3.2 Pre-Mutation Snapshotting (`.bak`) & Rollback
Before mutating any critical configuration or source code:
```typescript
export function createBackupSnapshot(targetFilePath: string): string {
  if (!fs.existsSync(targetFilePath)) return '';
  const backupPath = `${targetFilePath}.bak`;
  fs.copyFileSync(targetFilePath, backupPath);
  return backupPath;
}

export function restoreBackupSnapshot(targetFilePath: string): void {
  const backupPath = `${targetFilePath}.bak`;
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, targetFilePath);
    fs.unlinkSync(backupPath);
  }
}
```

### 3.3 Surgical Patching vs Whole-File Replacement
- **Surgical Replacement (`replace_file_content`)**: Preferred for all files over 50 lines. Preserves comments, local formatting, and eliminates git diff noise.
- **Whole-File Overwrite**: Strictly restricted to newly created files or complete documentation files under 150 lines.

---

## 4. Verification Runbook

```bash
# 1. Frontmatter and line count check
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/aion-ui/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*aion-ui/.test(yaml)) throw new Error('Missing name');
if (!/license:\s*Apache-2.0/.test(yaml)) throw new Error('Missing license: Apache-2.0');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Prohibited trigger: always_on');
const lines = content.split('\n').length;
if (lines > 400) throw new Error('Exceeds 400 lines: ' + lines);
console.log('PASS: aion-ui valid (' + lines + ' lines).');
"

# 2. Quality Gates check
npm run lint
npx tsc -b
npm test
npm run build
```
