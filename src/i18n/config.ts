import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import idTranslations from './id.json';
import enTranslations from './en.json';

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
