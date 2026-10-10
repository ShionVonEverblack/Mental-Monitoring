/**
 * Emergency Safety Card Data Service
 * Extracts primary coping strategy, trusted personal contacts, and crisis hotlines
 * for acute crisis de-escalation and cognitive constriction support.
 */

export interface EmergencyHotline {
  name: string;
  phone: string;
  href: string; // strictly 'tel:119,8' for 119 ext 8, 'tel:112' for 112
  description?: string;
}

export interface TrustedContact {
  name: string;
  phone?: string;
  relationship?: string;
}

export interface EmergencySafetyAction {
  primaryCopingStrategy: string;
  trustedContact: TrustedContact | null;
  hotline119: EmergencyHotline;
  hotline112: EmergencyHotline;
  somaticRoute: string; // '/grounding' or '/breathe'
}

export const HOTLINE_119: EmergencyHotline = {
  name: 'Healing 119 / SEJIWA (Kemenkes)',
  phone: '119 ext 8',
  href: 'tel:119,8',
  description: 'Layanan resmi pencegahan krisis jiwa & distres emosional Kemenkes RI (24 Jam)',
};

export const HOTLINE_112: EmergencyHotline = {
  name: 'Panggilan Darurat Bebas Pulsa (112)',
  phone: '112',
  href: 'tel:112',
  description: 'Nomor darurat nasional bebas pulsa untuk respons cepat dan ambulans pemda',
};

export const DEFAULT_COPING_STRATEGY =
  'Teknik napas 4-7-8 atau Grounding 5-4-3-2-1: Tarik napas 4 detik, hembuskan 6 detik, fokuskan pandangan pada 3 benda di sekitarmu.';

export const DEFAULT_SOMATIC_ROUTE = '/grounding';

/**
 * Standardizes telephony tel: links for mobile and desktop dialers.
 * Replaces 'ext' notations with a comma (,) for automated PBX extension dialing.
 */
export function formatPhoneTelUri(phone?: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  if (/ext/i.test(trimmed)) {
    const cleaned = trimmed.replace(/\s*ext\s*/i, ',').replace(/[^0-9+,]/g, '');
    return `tel:${cleaned}`;
  }

  // Already has comma notation (e.g. 119,8)
  if (trimmed.includes(',')) {
    const cleaned = trimmed.replace(/[^0-9+,]/g, '');
    return `tel:${cleaned}`;
  }

  // General phone number: keep + and digits
  const cleaned = trimmed.replace(/[^0-9+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
}

/**
 * Parses free-form contact text (e.g., from SafetyPlan socialContacts)
 * into structured TrustedContact with name, phone, and optional relationship.
 */
export function parseContactString(raw: string): TrustedContact {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { name: '' };
  }

  // Pattern 0: Pure phone number without letters (e.g. "0812-3456-7890", "+62 812-3456-7890", "(021) 1234-5678")
  // Evaluated before delimiter splitting to prevent treating hyphenated numbers as "name - phone"
  const purePhoneDigits = trimmed.replace(/\D/g, '');
  if (purePhoneDigits.length >= 3 && /^[\d\s\-+().]+$/.test(trimmed)) {
    return {
      name: trimmed,
      phone: trimmed,
    };
  }

  // Pattern 1: Parenthesized phone e.g., "Ibu (08123456789)" or "Ibu (0812-3456) - Keluarga"
  const parenMatch = trimmed.match(/^([^(]+)\s*\(([^)]+)\)\s*(?:[-–—:]\s*(.+))?$/);
  if (parenMatch) {
    const possibleName = parenMatch[1].trim();
    const insideParen = parenMatch[2].trim();
    const trailing = parenMatch[3]?.trim();
    if (insideParen.replace(/\D/g, '').length >= 4) {
      return {
        name: possibleName || insideParen,
        phone: insideParen,
        relationship: trailing,
      };
    }
  }

  // Pattern 2: Delimiter separated e.g., "Ayah - 0812-3456-7890" or "Budi: +628123456789"
  const delimMatch = trimmed.match(/^(.+?)\s*[-–—:]\s*(\+?[\d\s.-]{5,20})(?:\s*[-–—:]\s*(.+))?$/);
  if (delimMatch) {
    const digitsOnly = delimMatch[2].replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      return {
        name: delimMatch[1].trim(),
        phone: delimMatch[2].trim(),
        relationship: delimMatch[3]?.trim(),
      };
    }
  }

  // Pattern 3: Name followed by phone number at the end e.g., "Kakak 08123456789"
  const endPhoneMatch = trimmed.match(/^(.+?)\s+(\+?[\d-]{7,20})$/);
  if (endPhoneMatch) {
    return {
      name: endPhoneMatch[1].trim(),
      phone: endPhoneMatch[2].trim(),
    };
  }

  // Plain text without detectable phone
  return { name: trimmed };
}

/**
 * Extracts the user's primary coping strategy from localStorage 'rima-safety-plan',
 * falling back to evidence-based grounding default.
 */
export function extractPrimaryCopingStrategy(safetyPlanRaw?: string | null): string {
  let raw = safetyPlanRaw;
  if (raw === undefined) {
    try {
      raw = typeof window !== 'undefined' ? window.localStorage.getItem('rima-safety-plan') : null;
    } catch {
      raw = null;
    }
  }

  if (!raw) {
    return DEFAULT_COPING_STRATEGY;
  }

  try {
    const data = JSON.parse(raw);

    // Schema 1: Array of PlanSection (from SafetyPlan.tsx)
    if (Array.isArray(data)) {
      const copingSec = data.find(
        (sec: any) => sec && (sec.id === 'copingStrategies' || sec.id === 'coping')
      );
      if (copingSec && Array.isArray(copingSec.items) && copingSec.items.length > 0) {
        const first = copingSec.items.find(
          (item: any) => typeof item === 'string' && item.trim().length > 0
        );
        if (first) {
          return first.trim();
        }
      }
    }

    // Schema 2: Object with copingStrategies array (from types/index.ts SafetyPlan)
    if (data && typeof data === 'object') {
      if (Array.isArray(data.copingStrategies) && data.copingStrategies.length > 0) {
        const first = data.copingStrategies.find(
          (item: any) => typeof item === 'string' && item.trim().length > 0
        );
        if (first) {
          return first.trim();
        }
      }
    }
  } catch {
    // Malformed JSON fallback
  }

  return DEFAULT_COPING_STRATEGY;
}

/**
 * Extracts the user's primary trusted personal contact from localStorage
 * ('rima-trusted-contacts' or 'rima-safety-plan').
 */
export function extractPrimaryTrustedContact(
  trustedContactsRaw?: string | null,
  safetyPlanRaw?: string | null
): TrustedContact | null {
  // 1. Try dedicated 'rima-trusted-contacts'
  let contactsRaw = trustedContactsRaw;
  if (contactsRaw === undefined) {
    try {
      contactsRaw = typeof window !== 'undefined' ? window.localStorage.getItem('rima-trusted-contacts') : null;
    } catch {
      contactsRaw = null;
    }
  }

  if (contactsRaw) {
    try {
      const parsed = JSON.parse(contactsRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstValid = parsed.find(
          (c: any) => c && typeof c === 'object' && (c.name || c.phone)
        );
        if (firstValid) {
          return {
            name: String(firstValid.name || firstValid.phone || 'Kontak Tepercaya').trim(),
            phone: firstValid.phone ? String(firstValid.phone).trim() : undefined,
            relationship: firstValid.relationship ? String(firstValid.relationship).trim() : undefined,
          };
        }
      } else if (parsed && typeof parsed === 'object') {
        if (parsed.name || parsed.phone) {
          return {
            name: String(parsed.name || parsed.phone || 'Kontak Tepercaya').trim(),
            phone: parsed.phone ? String(parsed.phone).trim() : undefined,
            relationship: parsed.relationship ? String(parsed.relationship).trim() : undefined,
          };
        }
      } else if (typeof parsed === 'string' && parsed.trim()) {
        return parseContactString(parsed);
      }
    } catch {
      if (
        contactsRaw.trim() &&
        !contactsRaw.trim().startsWith('{') &&
        !contactsRaw.trim().startsWith('[')
      ) {
        return parseContactString(contactsRaw);
      }
    }
  }

  // 2. Fall back to 'rima-safety-plan'
  let planRaw = safetyPlanRaw;
  if (planRaw === undefined) {
    try {
      planRaw = typeof window !== 'undefined' ? window.localStorage.getItem('rima-safety-plan') : null;
    } catch {
      planRaw = null;
    }
  }

  if (planRaw) {
    try {
      const planData = JSON.parse(planRaw);

      // Schema 1: Array of PlanSection
      if (Array.isArray(planData)) {
        const contactSec = planData.find(
          (sec: any) => sec && (sec.id === 'socialContacts' || sec.id === 'peopleToContact')
        );
        if (contactSec && Array.isArray(contactSec.items) && contactSec.items.length > 0) {
          const firstItem = contactSec.items.find(
            (item: any) => typeof item === 'string' && item.trim().length > 0
          );
          if (firstItem) {
            return parseContactString(firstItem);
          }
        }
      }

      // Schema 2: Object with peopleToContact
      if (
        planData &&
        typeof planData === 'object' &&
        Array.isArray(planData.peopleToContact) &&
        planData.peopleToContact.length > 0
      ) {
        const first = planData.peopleToContact[0];
        if (first && (first.name || first.phone)) {
          return {
            name: String(first.name || first.phone).trim(),
            phone: first.phone ? String(first.phone).trim() : undefined,
            relationship: first.relationship ? String(first.relationship).trim() : undefined,
          };
        }
      }
    } catch {
      // Malformed JSON fallback
    }
  }

  return null;
}

/**
 * Returns complete emergency safety actions for the Fast-Action Safety Card.
 */
export function getEmergencySafetyActions(options?: {
  somaticPreference?: 'grounding' | 'breathe';
}): EmergencySafetyAction {
  const primaryCopingStrategy = extractPrimaryCopingStrategy();
  const trustedContact = extractPrimaryTrustedContact();
  const somaticRoute = options?.somaticPreference === 'breathe' ? '/breathe' : DEFAULT_SOMATIC_ROUTE;

  return {
    primaryCopingStrategy,
    trustedContact,
    hotline119: HOTLINE_119,
    hotline112: HOTLINE_112,
    somaticRoute,
  };
}
