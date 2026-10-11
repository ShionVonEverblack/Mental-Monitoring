---
name: rima-roadmap-architecture
description: Architectural specifications, Dual-Mode (100% Offline Air-Gapped vs Online Connected Hybrid), Zero-Knowledge E2EE by default, and Cognitive Load Reduction guidelines for RIMA's roadmap implementation.
license: MIT
---

# RIMA Roadmap & Dual-Mode Architecture Skill

## 1. Executive Summary & Purpose

This skill establishes the engineering standards, interface contracts, and architectural guardrails governing the implementation of RIMA's roadmap (2026–2027), as detailed in [`docs/PROJECT_ROADMAP.md`](file:///C:/Users/Hype/Kuliah/Proyekan/mental%20monitoring/docs/PROJECT_ROADMAP.md).

Every engineer and AI agent contributing to RIMA must uphold:
1. The **Dual-Mode Freedom** architecture (100% Offline Air-Gapped vs Online Connected Hybrid).
2. The **Zero-Knowledge E2EE** default posture for all persistent stores.
3. The **Cognitive Load Reduction** mandate: eliminating toxic streaks, choice overload in mood tracking, vanity metrics in forum interactions, and sensory overstimulation.

---

## 2. Dual-Mode Architecture Specification

```typescript
export type RimaOperatingMode = 'offline_airgapped' | 'online_hybrid';

export interface DualModeConfig {
  mode: RimaOperatingMode;
  networkAllowed: boolean;
  cloudSyncEnabled: boolean;
  forumAccessAllowed: boolean;
  localVaultOnly: boolean;
}
```

### Architectural Contract:
- **`offline_airgapped`**:
  - All outgoing network requests (HTTP, WebSocket, Supabase calls) are hard-blocked at the service layer.
  - Storage operates exclusively against local `IndexedDB` with Web Crypto AES-GCM-256 encryption.
  - Chatbot and RAG psychoeducation search execute entirely on-device (Transformers.js / MiniSearch / local corpus).
  - The UI clearly indicates a peaceful, air-gapped safe zone.
- **`online_hybrid`**:
  - The app gracefully adapts to connectivity changes (`navigator.onLine`).
  - Outgoing forum submissions and cloud backups use the **Offline Mutation Queue** when network drops occur.
  - Cloud backups to Supabase are strictly zero-knowledge: payloads are encrypted on-device before transmission.

---

## 3. Zero-Knowledge E2EE Storage by Default

### Cryptographic Standards:
- **Algorithm**: AES-GCM 256-bit.
- **Key Derivation**: PBKDF2 with SHA-256 ($\ge 600,000$ iterations) + unique 16-byte random salt.
- **IV Generation**: 12 bytes fresh random IV for every encryption operation (`crypto.getRandomValues`).
- **Zero Server Exposure**: The plaintext passkey never leaves volatile memory; the remote database (Supabase) only ever receives `ciphertext`, `iv`, `salt`, and `version`.

```typescript
// Architectural Envelope for E2EE Sync
export interface EncryptedSyncPayload {
  payloadVersion: number;
  cipherTextBase64: string;
  ivBase64: string;
  saltBase64: string;
  timestamp: string;
  dataHashSha256: string;
}
```

---

## 4. Cognitive Load Reduction Guidelines

In a mental health application, cognitive clutter and perceived judgment are active hazards that worsen depressive paralysis and anxiety.

### Prohibited Patterns (What to Reduce / Avoid):
1. **No Toxic Streaks**: Never display punishing counters like "Streak hilang! Kamu gagal login kemarin". Replace with **Mindful Momentum** or **Grace Period**: "Kamu telah hadir untuk dirimu 5 kali minggu ini. Istirahat juga bagian dari pemulihan."
2. **No Choice Overload in Mood Tracking**: Do not present endless grids of 50+ emoji chips. Group factors into **4 intuitive domains** based on the Yale Mood Meter quadrant:
   - *Diri Sendiri* (Pikiran, istirahat, kesehatan)
   - *Hubungan Sosial* (Keluarga, pertemanan, pasangan)
   - *Beban Aktivitas* (Pekerjaan, studi, tugas)
   - *Kondisi Fisik* (Tidur, nutrisi, kebugaran)
3. **No Social Vanity Metrics**: Strictly forbid like counters, follower counts, view stats, or gamified status badges in the anonymous peer forum. Support is expressed via warm empathy reactions without competitive sorting.
4. **No Sensory Overstimulation**: Avoid rapid flashing animations, jarring micro-interactions, or loud sound effects. Comply with `data-sensory="low-stimulation"` and reduced-motion user preferences.

---

## 5. Offline Mutation Queue & Conflict Resolution

When a user performs actions (e.g., saves a journal entry, marks a habit as completed, or posts to the anonymous forum) while offline or in poor network conditions:

1. **Local-First Write**: The action is committed immediately to the local `IndexedDB` store.
2. **Enqueue Mutation**: An entry is appended to the `offline_mutation_queue`:
   ```typescript
   export interface OfflineMutation {
     id: string; // UUIDv4
     actionType: 'CREATE_POST' | 'UPDATE_JOURNAL' | 'SYNC_BACKUP';
     payload: EncryptedSyncPayload | unknown;
     createdAt: string;
     retryCount: number;
   }
   ```
3. **Non-Destructive Merge**: When network connection is re-established, the queue processes sequentially. In case of concurrent modifications, use deterministic timestamp tie-breaking without overwriting user journals.

---

## 6. Implementation Quality Gates

Every feature implementation under the roadmap must pass:
1. `npm run lint` (`oxlint`) $\rightarrow$ 0 errors, 0 warnings.
2. `npx tsc -b` $\rightarrow$ 0 errors.
3. `npm test` (`vitest run`) $\rightarrow$ 100% test suite passing.
4. `npm run build` $\rightarrow$ Clean PWA production build.
5. 100% i18n translation parity across all 8 languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) + RTL Arab support.
6. Pure vanilla CSS tokens (Zero Tailwind CSS).
