---
name: rima-offline-security
description: >-
  Security, privacy, and data governance architecture for RIMA.
  Use when implementing or modifying storage, cryptographic functions, data export/import,
  backup/restore, user consent, data purging (right to erasure), Supabase Row Level Security (RLS),
  or ensuring compliance with Indonesian UU PDP No. 27/2022 and HIPAA/GDPR health privacy standards.
---

# RIMA Offline-First Security & Privacy Architecture

## 1. Regulatory Context: UU PDP No. 27/2022 Compliance

Under the Indonesian **Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022)**, Pasal 4 Ayat 2 huruf d:
> *"Data dan informasi kesehatan termasuk dalam kategori Data Pribadi yang Bersifat Spesifik (Specific Personal Data)."*

### Mandates for RIMA:
1. **Explicit Consent (Persetujuan Eksplisit)**: Users must explicitly agree to local data processing via `<ConsentModal />` before any health data is captured.
2. **Data Minimization (Minimisasi Data)**: Do not collect real names, NIK, phone numbers, GPS locations, or device identifiers.
3. **Local Sovereignty**: All mood entries, journals, and safety plans reside solely in the user's browser `localStorage`.
4. **Zero Third-Party Telemetry**: Never integrate trackers, ad pixels, or analytics SDKs that transmit mental health metrics.
5. **Right to Erasure (Hak Penghapusan / Hak Dilupakan)**: Users must have a 1-tap mechanism to completely purge all local records.

---

## 2. LocalStorage Key Registry

All local storage keys must follow the strict `rima-*` prefix:

| Key | Type | Description | Sensitivity |
|:---|:---|:---|:---|
| `rima-moods` | `MoodEntry[]` | Daily mood logs, scores, factors, notes | HIGH (Spesifik) |
| `rima-journals` | `JournalEntry[]` | Freeform & CBT reflections | HIGH (Spesifik) |
| `rima-safety-plan` | `SafetyPlan` | Stanley-Brown suicide prevention plan | CRITICAL |
| `rima-escalation-log` | `EscalationLog[]` | Timestamped Level 2/3 risk escalations | HIGH (Clinical) |
| `rima-breathing-sessions`| `BreathingSession[]` | Somatic exercise durations & reflections | MODERATE |
| `rima-user-profile` | `UserProfile` | Anonymous alias, streak, preferences | LOW |
| `rima-notification-settings`| `NotificationSettings` | Reminder times & quiet hours | LOW |
| `rima-consent-agreed` | `boolean` | Timestamp of UU PDP consent acknowledgment | AUDIT |
| `i18nextLng` | `string` | Active language code (`id`, `en`, etc.) | SYSTEM |

---

## 3. Cryptography & Data Protection at Rest

For maximum user privacy on shared or domestic devices, RIMA utilizes the native browser **Web Crypto API** (`window.crypto.subtle`):

### AES-GCM 256-Bit Standard:
- **Algorithm**: `AES-GCM` with 256-bit key length.
- **IV Generation**: Cryptographically secure pseudo-random numbers (`crypto.getRandomValues(new Uint8Array(12))`).
- **Key Derivation**: `PBKDF2` with SHA-256 and $\ge 100,000$ iterations when deriving from a user-supplied PIN.

```typescript
// Standard Web Crypto helper pattern for RIMA
export async function deriveKeyFromPIN(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

---

## 4. Secure Backup, Import & Export Protocols

Located in `src/utils/exportImport.ts`:

### CSV Injection Prevention:
When generating CSVs (`exportMoodsAsCSV`, `exportJournalsAsCSV`):
- All user-supplied string fields must be escaped: formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) must be sanitized.
- Wrap all fields in double-quotes and escape internal quotes by doubling them (`""`).
- Prepend UTF-8 BOM (`\uFEFF`) to preserve non-Latin scripts (Arabic, Japanese, Chinese).

### JSON Import Validation:
- Never trust imported JSON blindly.
- Use explicit validator predicates (`isValidMoodEntry`, `isValidJournalEntry`).
- Disallow prototype pollution (`__proto__`, `constructor`).
- Bound entry counts and validate ISO timestamp formats.

---

## 5. Right to Erasure (Complete Data Purge)

Implementation pattern for `Profile.tsx` / Settings:

```typescript
export function purgeAllUserData(): void {
  const rimaKeys = [
    'rima-moods',
    'rima-journals',
    'rima-safety-plan',
    'rima-escalation-log',
    'rima-breathing-sessions',
    'rima-user-profile',
    'rima-notification-settings',
    'rima-forum-guidelines-seen',
    'rima-theme',
  ];
  
  rimaKeys.forEach(k => localStorage.removeItem(k));
  
  // Clear Service Worker caches if offline data exists
  if ('caches' in window) {
    caches.keys().then(names => names.forEach(name => caches.delete(name)));
  }

  // Dispatch event for reactive UI reset
  window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'ALL_PURGED' } }));
}
```

---

## 6. Supabase Community Forum Security (RLS)

If the Supabase backend is active (`supabase_schema.sql`):
1. **Row Level Security (RLS)** MUST be enabled on `forum_posts` and `forum_comments`.
2. Anonymous posting must use ephemeral UUIDs generated client-side (`generateAnonymousName()`).
3. Posts detected with **severe crisis keywords** must NEVER be inserted into the database (blocked client-side by `CrisisInterceptor`).
4. Read policies allow `SELECT` for public, but `UPDATE` and `DELETE` are restricted strictly to moderation service roles.
