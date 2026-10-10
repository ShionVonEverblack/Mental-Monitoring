import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  formatPhoneTelUri,
  parseContactString,
  extractPrimaryCopingStrategy,
  extractPrimaryTrustedContact,
  getEmergencySafetyActions,
  DEFAULT_COPING_STRATEGY,
  DEFAULT_SOMATIC_ROUTE,
  HOTLINE_119,
  HOTLINE_112,
} from '../safetyCardService';

describe('safetyCardService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('formatPhoneTelUri', () => {
    it('formats standard local phone numbers', () => {
      expect(formatPhoneTelUri('0812-3456-7890')).toBe('tel:081234567890');
      expect(formatPhoneTelUri('0812 3456 7890')).toBe('tel:081234567890');
    });

    it('formats international phone numbers preserving leading plus', () => {
      expect(formatPhoneTelUri('+62 812-3456-7890')).toBe('tel:+6281234567890');
      expect(formatPhoneTelUri('+6281234567890')).toBe('tel:+6281234567890');
    });

    it('replaces extension notation with a comma for automated dialers', () => {
      expect(formatPhoneTelUri('119 ext 8')).toBe('tel:119,8');
      expect(formatPhoneTelUri('119 Ext 8')).toBe('tel:119,8');
      expect(formatPhoneTelUri('119  ext  8')).toBe('tel:119,8');
    });

    it('preserves existing comma notation', () => {
      expect(formatPhoneTelUri('119,8')).toBe('tel:119,8');
    });

    it('formats 3-digit emergency dispatch lines', () => {
      expect(formatPhoneTelUri('112')).toBe('tel:112');
      expect(formatPhoneTelUri('119')).toBe('tel:119');
    });

    it('returns empty string for empty or non-string values', () => {
      expect(formatPhoneTelUri('')).toBe('');
      expect(formatPhoneTelUri('   ')).toBe('');
      expect(formatPhoneTelUri(undefined)).toBe('');
      expect(formatPhoneTelUri(null as unknown as string)).toBe('');
    });
  });

  describe('parseContactString', () => {
    it('parses name and parenthesized phone number', () => {
      const result = parseContactString('Ibu (08123456789)');
      expect(result.name).toBe('Ibu');
      expect(result.phone).toBe('08123456789');
    });

    it('parses name, parenthesized phone, and relationship', () => {
      const result = parseContactString('Kakak (0811223344) - Saudara');
      expect(result.name).toBe('Kakak');
      expect(result.phone).toBe('0811223344');
      expect(result.relationship).toBe('Saudara');
    });

    it('parses delimiter-separated name and phone', () => {
      const dash = parseContactString('Ayah - 0812-3456-7890');
      expect(dash.name).toBe('Ayah');
      expect(dash.phone).toBe('0812-3456-7890');

      const colon = parseContactString('Budi: +628123456789');
      expect(colon.name).toBe('Budi');
      expect(colon.phone).toBe('+628123456789');
    });

    it('parses name followed by trailing phone number', () => {
      const result = parseContactString('Sahabat 081234567890');
      expect(result.name).toBe('Sahabat');
      expect(result.phone).toBe('081234567890');
    });

    it('handles pure phone number string', () => {
      const result = parseContactString('08123456789');
      expect(result.name).toBe('08123456789');
      expect(result.phone).toBe('08123456789');
    });

    it('handles pure unlabelled hyphenated and formatted phone numbers without splitting on dash', () => {
      const hyphenated = parseContactString('0812-3456-7890');
      expect(hyphenated.name).toBe('0812-3456-7890');
      expect(hyphenated.phone).toBe('0812-3456-7890');

      const international = parseContactString('+62 812-3456-7890');
      expect(international.name).toBe('+62 812-3456-7890');
      expect(international.phone).toBe('+62 812-3456-7890');

      const parenthesized = parseContactString('(021) 1234-5678');
      expect(parenthesized.name).toBe('(021) 1234-5678');
      expect(parenthesized.phone).toBe('(021) 1234-5678');
    });

    it('returns name without phone when no digits exist', () => {
      const result = parseContactString('Teman Sekamar');
      expect(result.name).toBe('Teman Sekamar');
      expect(result.phone).toBeUndefined();
    });

    it('returns empty name on blank string', () => {
      expect(parseContactString('').name).toBe('');
      expect(parseContactString('   ').name).toBe('');
    });
  });

  describe('extractPrimaryCopingStrategy', () => {
    it('returns default strategy when localStorage is empty', () => {
      expect(extractPrimaryCopingStrategy()).toBe(DEFAULT_COPING_STRATEGY);
    });

    it('extracts primary strategy from PlanSection[] in rima-safety-plan', () => {
      const plan = [
        {
          id: 'warningSigns',
          items: ['Jantung berdebar'],
        },
        {
          id: 'copingStrategies',
          items: ['Jalan kaki santai 10 menit', 'Mendengarkan musik'],
        },
      ];
      localStorage.setItem('rima-safety-plan', JSON.stringify(plan));

      expect(extractPrimaryCopingStrategy()).toBe('Jalan kaki santai 10 menit');
    });

    it('extracts primary strategy from object schema in rima-safety-plan', () => {
      const plan = {
        copingStrategies: ['Teknik visualisasi tempat aman', 'Minum air hangat'],
      };
      localStorage.setItem('rima-safety-plan', JSON.stringify(plan));

      expect(extractPrimaryCopingStrategy()).toBe('Teknik visualisasi tempat aman');
    });

    it('falls back to default if copingStrategies array is empty', () => {
      const plan = [
        {
          id: 'copingStrategies',
          items: [],
        },
      ];
      localStorage.setItem('rima-safety-plan', JSON.stringify(plan));

      expect(extractPrimaryCopingStrategy()).toBe(DEFAULT_COPING_STRATEGY);
    });

    it('handles malformed JSON gracefully', () => {
      localStorage.setItem('rima-safety-plan', 'INVALID_JSON{[[[');
      expect(extractPrimaryCopingStrategy()).toBe(DEFAULT_COPING_STRATEGY);
    });
  });

  describe('extractPrimaryTrustedContact', () => {
    it('returns null when no contact information exists in storage', () => {
      expect(extractPrimaryTrustedContact()).toBeNull();
    });

    it('extracts structured contact from rima-trusted-contacts array', () => {
      const contacts = [
        { name: 'Dr. Sari', phone: '0811998877', relationship: 'Terapis' },
        { name: 'Teman', phone: '0812334455' },
      ];
      localStorage.setItem('rima-trusted-contacts', JSON.stringify(contacts));

      const contact = extractPrimaryTrustedContact();
      expect(contact).not.toBeNull();
      expect(contact?.name).toBe('Dr. Sari');
      expect(contact?.phone).toBe('0811998877');
      expect(contact?.relationship).toBe('Terapis');
    });

    it('extracts single contact object from rima-trusted-contacts', () => {
      const contactObj = { name: 'Pasangan', phone: '081200001111' };
      localStorage.setItem('rima-trusted-contacts', JSON.stringify(contactObj));

      const contact = extractPrimaryTrustedContact();
      expect(contact?.name).toBe('Pasangan');
      expect(contact?.phone).toBe('081200001111');
    });

    it('falls back to rima-safety-plan socialContacts section when rima-trusted-contacts is not set', () => {
      const plan = [
        {
          id: 'socialContacts',
          items: ['Ibu (08123456789)'],
        },
      ];
      localStorage.setItem('rima-safety-plan', JSON.stringify(plan));

      const contact = extractPrimaryTrustedContact();
      expect(contact?.name).toBe('Ibu');
      expect(contact?.phone).toBe('08123456789');
    });

    it('falls back to rima-safety-plan peopleToContact object schema', () => {
      const plan = {
        peopleToContact: [
          { name: 'Kakak', phone: '+6281987654321', relationship: 'Keluarga' },
        ],
      };
      localStorage.setItem('rima-safety-plan', JSON.stringify(plan));

      const contact = extractPrimaryTrustedContact();
      expect(contact?.name).toBe('Kakak');
      expect(contact?.phone).toBe('+6281987654321');
      expect(contact?.relationship).toBe('Keluarga');
    });

    it('handles malformed JSON in contacts storage gracefully', () => {
      localStorage.setItem('rima-trusted-contacts', '{not-valid-json}');
      expect(extractPrimaryTrustedContact()).toBeNull();
    });
  });

  describe('getEmergencySafetyActions', () => {
    it('returns full safety action bundle with default values', () => {
      const actions = getEmergencySafetyActions();

      expect(actions.primaryCopingStrategy).toBe(DEFAULT_COPING_STRATEGY);
      expect(actions.trustedContact).toBeNull();

      // Crisis line 119 Ext 8 must be strictly formatted as href="tel:119,8"
      expect(actions.hotline119).toEqual(HOTLINE_119);
      expect(actions.hotline119.href).toBe('tel:119,8');
      expect(actions.hotline119.phone).toBe('119 ext 8');

      // 112 emergency line
      expect(actions.hotline112).toEqual(HOTLINE_112);
      expect(actions.hotline112.href).toBe('tel:112');

      // Default somatic route
      expect(actions.somaticRoute).toBe(DEFAULT_SOMATIC_ROUTE);
    });

    it('returns somaticRoute="/breathe" when somaticPreference="breathe" is specified', () => {
      const actions = getEmergencySafetyActions({ somaticPreference: 'breathe' });
      expect(actions.somaticRoute).toBe('/breathe');
    });

    it('incorporates stored safety plan and trusted contacts into bundle', () => {
      localStorage.setItem(
        'rima-safety-plan',
        JSON.stringify([
          { id: 'copingStrategies', items: ['Tarik napas dalam'] },
        ])
      );
      localStorage.setItem(
        'rima-trusted-contacts',
        JSON.stringify([{ name: 'Rina', phone: '081299990000' }])
      );

      const actions = getEmergencySafetyActions();
      expect(actions.primaryCopingStrategy).toBe('Tarik napas dalam');
      expect(actions.trustedContact?.name).toBe('Rina');
      expect(actions.trustedContact?.phone).toBe('081299990000');
    });
  });
});
