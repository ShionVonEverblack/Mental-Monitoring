---
name: rima-privacy-telemetry
description: >-
  Standards and architectures for privacy-preserving telemetry, differential privacy,
  local-first clinical auditing, and Indonesian UU PDP / GDPR Article 9 compliance in RIMA.
  Use when designing population health aggregate dashboards, evaluating app effectiveness,
  or preventing leakage of special-category mental health telemetry.
---

# RIMA Privacy-Preserving Telemetry & Local Clinical Audit

## 1. Regulatory Context & Legal Obligations

Under **Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27 Tahun 2022)** and **GDPR Article 9**:
- **Special Category Data (Data Pribadi Spesifik)**: Data concerning physical and mental health (*data kesehatan*) receives the highest tier of statutory protection.
- **Explicit Consent**: Consent must be granular, informed, and revocable at any time without punitive service restriction.
- **Data Minimization (Minimisasi Data)**: Collecting advertising IDs, device fingerprints (Canvas/WebGL fingerprinting), or network location IP is prohibited.
- **Sanctions**: Breaches of health data confidentiality carry statutory criminal and administrative liabilities under Pasal 67 & 68 UU PDP.

---

## 2. The Zero-PII Telemetry Architecture

RIMA operates on a **strict local-first aggregation model**:
1. **Zero External Trackers**: Never load Google Analytics, Meta Pixel, Hotjar, Mixpanel, or third-party error trackers that serialize DOM text.
2. **Local Metric Computation**: App retention, session frequency, and PHQ-9 delta ($\Delta\text{Score} = \text{Score}_{\text{now}} - \text{Score}_{\text{baseline}}$) are computed entirely on the client's device.
3. **Opt-In Research Aggregation**: If aggregated research data is ever shared with partnering institutions (e.g., campus wellness centers or Kemenkes):
   - Enforce **$k$-Anonymity ($k \ge 10$)**: Never report cohorts with fewer than 10 individuals to prevent re-identification.
   - Enforce **Differential Privacy ($\epsilon \le 1.0$)**: Inject calibrated Laplace noise into cohort counts.

---

## 3. Differential Privacy Implementation (Laplace Mechanism)

```typescript
/**
 * Generates random noise from a Laplace distribution: Lap(0, b)
 * where b = sensitivity / epsilon.
 */
export function sampleLaplace(b: number): number {
  const u = Math.random() - 0.5;
  return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Perturbs an aggregate metric count using epsilon-differential privacy.
 * @param trueCount The actual count of events
 * @param epsilon Privacy loss parameter (smaller = stronger privacy, e.g. 0.5)
 * @param sensitivity Maximum impact of a single user (for counting queries, sensitivity = 1)
 */
export function differentiallyPrivateCount(
  trueCount: number,
  epsilon = 0.5,
  sensitivity = 1
): number {
  const b = sensitivity / epsilon;
  const noisy = trueCount + sampleLaplace(b);
  return Math.max(0, Math.round(noisy));
}
```

---

## 4. Local Transparency Audit Trail (`AuditLogger`)

Users must have sovereign visibility over what happens to their data locally. Every sensitive read, write, export, or purge operation writes to a tamper-evident local log:

```typescript
export type AuditAction =
  | 'AUTH_UNLOCK'
  | 'ENTRY_ENCRYPTED'
  | 'ENTRY_DECRYPTED'
  | 'BACKUP_EXPORTED'
  | 'DATA_WIPED'
  | 'REFERRAL_PRINTED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: AuditAction;
  details: string;
}

export class LocalAuditLogger {
  private static KEY = 'rima-audit-trail';
  private static MAX_EVENTS = 50;

  static log(action: AuditAction, details: string): void {
    try {
      const existing = this.getHistory();
      const newEvent: AuditEvent = {
        id: 'aud-' + Date.now(),
        timestamp: new Date().toISOString(),
        action,
        details,
      };
      const updated = [newEvent, ...existing].slice(0, this.MAX_EVENTS);
      localStorage.setItem(this.KEY, JSON.stringify(updated));
    } catch {
      // Fail silently to avoid breaking primary workflows
    }
  }

  static getHistory(): AuditEvent[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static clear(): void {
    localStorage.removeItem(this.KEY);
  }
}
```

---

## 5. Pre-Deployment Privacy Audit Checklist

Before releasing any new feature or analytics component, verify:
- [ ] No `fetch()` or `XMLHttpRequest` transmits plaintext journal content or screening answers.
- [ ] Error logging strips sensitive strings, form fields, and user notes before outputting to console.
- [ ] Export files (JSON/CSV) clearly alert the user: *"Berkas ini berisi data medis pribadi Anda. Simpan di tempat yang aman."*
- [ ] `wipeAllData` resets IndexedDB, localStorage, sessionStorage, and unregisters all service workers.
