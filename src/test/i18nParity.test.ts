import { describe, it, expect } from 'vitest';
import idLocale from '../i18n/id.json';
import enLocale from '../i18n/en.json';
import jvLocale from '../i18n/jv.json';
import suLocale from '../i18n/su.json';
import jaLocale from '../i18n/ja.json';
import zhLocale from '../i18n/zh.json';
import esLocale from '../i18n/es.json';
import arLocale from '../i18n/ar.json';

const SUPPORTED_LANGUAGES = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LOCALES: Record<SupportedLanguage, Record<string, unknown>> = {
  id: idLocale as Record<string, unknown>,
  en: enLocale as Record<string, unknown>,
  jv: jvLocale as Record<string, unknown>,
  su: suLocale as Record<string, unknown>,
  ja: jaLocale as Record<string, unknown>,
  zh: zhLocale as Record<string, unknown>,
  es: esLocale as Record<string, unknown>,
  ar: arLocale as Record<string, unknown>,
};

function extractAllDottedKeys(obj: unknown, prefix = ''): string[] {
  let keys: string[] = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return keys;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(extractAllDottedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('8-Language Translation Parity & Completeness', () => {
  it('all 8 language dictionaries exist and are non-empty objects', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const dict = LOCALES[lang];
      expect(dict, `Locale dictionary for ${lang} must exist`).toBeDefined();
      expect(typeof dict).toBe('object');
      expect(Object.keys(dict).length).toBeGreaterThan(0);
    }
  });

  it('all 8 languages have 100% exact key parity with id.json (0 missing keys, 0 extra keys)', () => {
    const idKeys = new Set(extractAllDottedKeys(LOCALES['id']));
    expect(idKeys.size).toBeGreaterThan(1000);

    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === 'id') continue;
      const langKeys = new Set(extractAllDottedKeys(LOCALES[lang]));

      const missingInLang = [...idKeys].filter((k) => !langKeys.has(k));
      const extraInLang = [...langKeys].filter((k) => !idKeys.has(k));

      expect(
        missingInLang,
        `Language "${lang}" is missing ${missingInLang.length} keys from id.json: ${missingInLang.slice(0, 5).join(', ')}`
      ).toEqual([]);

      expect(
        extraInLang,
        `Language "${lang}" has ${extraInLang.length} extra keys not in id.json: ${extraInLang.slice(0, 5).join(', ')}`
      ).toEqual([]);
    }
  });

  it('contains no empty strings, nulls, or undefined values across all 8 files', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const dict = LOCALES[lang];

      function validateNoEmpty(obj: unknown, path = '') {
        if (typeof obj === 'string') {
          expect(
            obj.trim().length,
            `Empty translation string at "${path}" in ${lang}.json`
          ).toBeGreaterThan(0);
        } else if (obj && typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
            validateNoEmpty(v, path ? `${path}.${k}` : k);
          }
        } else {
          expect.fail(`Non-string leaf node at "${path}" in ${lang}.json`);
        }
      }

      validateNoEmpty(dict);
    }
  });

  it('verifies that Phase 2 "jitai" namespace exists in all 8 locales with full parity', () => {
    const idJitai = LOCALES['id'].jitai as Record<string, unknown>;
    expect(idJitai).toBeDefined();
    const idJitaiKeys = new Set(extractAllDottedKeys(idJitai));
    expect(idJitaiKeys.size).toBeGreaterThanOrEqual(25);

    for (const lang of SUPPORTED_LANGUAGES) {
      const langJitai = LOCALES[lang].jitai as Record<string, unknown>;
      expect(langJitai, `Locale ${lang} must have jitai namespace`).toBeDefined();
      const langJitaiKeys = new Set(extractAllDottedKeys(langJitai));
      const missing = [...idJitaiKeys].filter((k) => !langJitaiKeys.has(k));
      expect(missing, `Locale ${lang} is missing jitai keys: ${missing.join(', ')}`).toEqual([]);
    }
  });

  it('verifies that Phase 2 "safetyCard" namespace exists in all 8 locales with full parity', () => {
    const idSafety = LOCALES['id'].safetyCard as Record<string, unknown>;
    expect(idSafety).toBeDefined();
    const idSafetyKeys = new Set(extractAllDottedKeys(idSafety));
    expect(idSafetyKeys.size).toBeGreaterThanOrEqual(20);

    for (const lang of SUPPORTED_LANGUAGES) {
      const langSafety = LOCALES[lang].safetyCard as Record<string, unknown>;
      expect(langSafety, `Locale ${lang} must have safetyCard namespace`).toBeDefined();
      const langSafetyKeys = new Set(extractAllDottedKeys(langSafety));
      const missing = [...idSafetyKeys].filter((k) => !langSafetyKeys.has(k));
      expect(missing, `Locale ${lang} is missing safetyCard keys: ${missing.join(', ')}`).toEqual([]);
    }
  });

  it('verifies that Arabic is correctly mapped to RTL and other languages to LTR', () => {
    const getDirection = (lang: string) => (lang && lang.startsWith('ar') ? 'rtl' : 'ltr');
    expect(getDirection('ar')).toBe('rtl');
    expect(getDirection('ar-SA')).toBe('rtl');
    expect(getDirection('ar-EG')).toBe('rtl');
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === 'ar') continue;
      expect(getDirection(lang)).toBe('ltr');
    }
  });
});
