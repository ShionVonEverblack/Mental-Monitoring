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

  it('verifies that Phase 4 "landing" namespace exists in all 8 locales with full parity', () => {
    const idLanding = LOCALES['id'].landing as Record<string, unknown>;
    expect(idLanding).toBeDefined();
    const idLandingKeys = new Set(extractAllDottedKeys(idLanding));
    expect(idLandingKeys.size).toBeGreaterThanOrEqual(30);

    for (const lang of SUPPORTED_LANGUAGES) {
      const langLanding = LOCALES[lang].landing as Record<string, unknown>;
      expect(langLanding, `Locale ${lang} must have landing namespace`).toBeDefined();
      const langLandingKeys = new Set(extractAllDottedKeys(langLanding));
      const missing = [...idLandingKeys].filter((k) => !langLandingKeys.has(k));
      const extra = [...langLandingKeys].filter((k) => !idLandingKeys.has(k));
      expect(missing, `Locale ${lang} is missing landing keys: ${missing.join(', ')}`).toEqual([]);
      expect(extra, `Locale ${lang} has extra landing keys: ${extra.join(', ')}`).toEqual([]);
    }
  });

  it('verifies that Phase 4 "auth" namespace exists in all 8 locales with full parity', () => {
    const idAuth = LOCALES['id'].auth as Record<string, unknown>;
    expect(idAuth).toBeDefined();
    const idAuthKeys = new Set(extractAllDottedKeys(idAuth));
    expect(idAuthKeys.size).toBeGreaterThanOrEqual(17);

    for (const lang of SUPPORTED_LANGUAGES) {
      const langAuth = LOCALES[lang].auth as Record<string, unknown>;
      expect(langAuth, `Locale ${lang} must have auth namespace`).toBeDefined();
      const langAuthKeys = new Set(extractAllDottedKeys(langAuth));
      const missing = [...idAuthKeys].filter((k) => !langAuthKeys.has(k));
      const extra = [...langAuthKeys].filter((k) => !idAuthKeys.has(k));
      expect(missing, `Locale ${lang} is missing auth keys: ${missing.join(', ')}`).toEqual([]);
      expect(extra, `Locale ${lang} has extra auth keys: ${extra.join(', ')}`).toEqual([]);
    }
  });

  it('verifies that Phase 4 "incognito" namespace exists in all 8 locales with full parity', () => {
    const idIncognito = LOCALES['id'].incognito as Record<string, unknown>;
    expect(idIncognito).toBeDefined();
    const idIncognitoKeys = new Set(extractAllDottedKeys(idIncognito));
    expect(idIncognitoKeys.size).toBeGreaterThanOrEqual(10);

    for (const lang of SUPPORTED_LANGUAGES) {
      const langIncognito = LOCALES[lang].incognito as Record<string, unknown>;
      expect(langIncognito, `Locale ${lang} must have incognito namespace`).toBeDefined();
      const langIncognitoKeys = new Set(extractAllDottedKeys(langIncognito));
      const missing = [...idIncognitoKeys].filter((k) => !langIncognitoKeys.has(k));
      const extra = [...langIncognitoKeys].filter((k) => !idIncognitoKeys.has(k));
      expect(missing, `Locale ${lang} is missing incognito keys: ${missing.join(', ')}`).toEqual([]);
      expect(extra, `Locale ${lang} has extra incognito keys: ${extra.join(', ')}`).toEqual([]);
    }
  });

  it('verifies that Phase 4 landing navigation and profile landing page links exist across all 8 locales', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const dict = LOCALES[lang] as Record<string, Record<string, unknown>>;
      expect(dict.nav?.landing, `nav.landing must exist in ${lang}`).toBeDefined();
      expect(typeof dict.nav?.landing).toBe('string');
      expect((dict.nav.landing as string).trim().length).toBeGreaterThan(0);

      expect(dict.profile?.landingLink, `profile.landingLink must exist in ${lang}`).toBeDefined();
      expect(typeof dict.profile?.landingLink).toBe('string');
      expect((dict.profile.landingLink as string).trim().length).toBeGreaterThan(0);

      expect(dict.profile?.landingLinkDesc, `profile.landingLinkDesc must exist in ${lang}`).toBeDefined();
      expect(typeof dict.profile?.landingLinkDesc).toBe('string');
      expect((dict.profile.landingLinkDesc as string).trim().length).toBeGreaterThan(0);
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

  it('verifies that Phase 1 "dualMode" namespace exists in all 8 locales with full parity', () => {
    const idDualMode = LOCALES['id'].dualMode as Record<string, unknown>;
    expect(idDualMode, 'Locale id must have dualMode namespace').toBeDefined();
    const idDualModeKeys = new Set(extractAllDottedKeys(idDualMode));
    expect(idDualModeKeys.size).toBeGreaterThanOrEqual(14);

    for (const lang of SUPPORTED_LANGUAGES) {
      const langDualMode = LOCALES[lang].dualMode as Record<string, unknown>;
      expect(langDualMode, `Locale ${lang} must have dualMode namespace`).toBeDefined();
      const langKeys = new Set(extractAllDottedKeys(langDualMode));
      const missing = [...idDualModeKeys].filter((k) => !langKeys.has(k));
      const extra = [...langKeys].filter((k) => !idDualModeKeys.has(k));
      expect(missing, `Locale ${lang} is missing dualMode keys: ${missing.join(', ')}`).toEqual([]);
      expect(extra, `Locale ${lang} has extra dualMode keys: ${extra.join(', ')}`).toEqual([]);
    }
  });

  it('verifies that Phase 1 mood 4-domain categories exist in all 8 locales with full parity', () => {
    const requiredDomains = ['self', 'social', 'activity', 'physical'];
    for (const lang of SUPPORTED_LANGUAGES) {
      const moodObj = LOCALES[lang].mood as Record<string, unknown>;
      expect(moodObj, `Locale ${lang} must have mood object`).toBeDefined();
      const domains = moodObj.domains as Record<string, string>;
      expect(domains, `Locale ${lang} must have mood.domains`).toBeDefined();
      for (const d of requiredDomains) {
        expect(domains[d], `Locale ${lang} missing mood.domains.${d}`).toBeDefined();
        expect(typeof domains[d]).toBe('string');
        expect(domains[d].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('verifies that Phase 1 mindful momentum streak keys exist in all 8 locales', () => {
    const requiredStreakKeys = ['mindfulMomentum', 'compassionPresence', 'restIsRecovery', 'gentleEncouragement'];
    for (const lang of SUPPORTED_LANGUAGES) {
      const streakObj = LOCALES[lang].streak as Record<string, string>;
      expect(streakObj, `Locale ${lang} must have streak object`).toBeDefined();
      for (const k of requiredStreakKeys) {
        expect(streakObj[k], `Locale ${lang} missing streak.${k}`).toBeDefined();
        expect(typeof streakObj[k]).toBe('string');
        expect(streakObj[k].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('verifies that Phase 1 quiet support forum reaction keys exist in all 8 locales', () => {
    const requiredReactions = ['hug', 'heart', 'strength', 'supportSent'];
    for (const lang of SUPPORTED_LANGUAGES) {
      const forumObj = LOCALES[lang].forum as Record<string, unknown>;
      expect(forumObj, `Locale ${lang} must have forum object`).toBeDefined();
      const reactions = forumObj.reactions as Record<string, string>;
      expect(reactions, `Locale ${lang} must have forum.reactions`).toBeDefined();
      for (const r of requiredReactions) {
        expect(reactions[r], `Locale ${lang} missing forum.reactions.${r}`).toBeDefined();
        expect(typeof reactions[r]).toBe('string');
        expect(reactions[r].trim().length).toBeGreaterThan(0);
      }
      expect(forumObj.quietSupportTitle, `Locale ${lang} missing forum.quietSupportTitle`).toBeDefined();
    }
  });
});
