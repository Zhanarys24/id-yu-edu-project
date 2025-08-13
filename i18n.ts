import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'kz', 'en'],
    ns: ['common'],
    defaultNS: 'common',
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      // Prefer saved locale in localStorage, then browser language
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    backend: {
      // Load from public folder
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // Cache-busting for translation updates
      queryStringParams: { v: '1.0.1' },
    },
    react: { useSuspense: false },
  })

export default i18n
