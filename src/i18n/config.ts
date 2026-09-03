import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import idTranslations from './id.json';
import enTranslations from './en.json';
import jvTranslations from './jv.json';
import suTranslations from './su.json';
import jaTranslations from './ja.json';
import zhTranslations from './zh.json';
import esTranslations from './es.json';
import arTranslations from './ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: {
        translation: idTranslations,
      },
      en: {
        translation: enTranslations,
      },
      jv: {
        translation: jvTranslations,
      },
      su: {
        translation: suTranslations,
      },
      ja: {
        translation: jaTranslations,
      },
      zh: {
        translation: zhTranslations,
      },
      es: {
        translation: esTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'rima-language',
    },
  });

export default i18n;
