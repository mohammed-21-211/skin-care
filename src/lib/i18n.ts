import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ar } from '@/locales/ar';
import { en } from '@/locales/en';
import { env } from '@/config/env';
import type { Language } from '@/types';

const STORAGE_KEY = 'skincare.lang';

export function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  return stored ?? env.defaultLanguage;
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Apply the language to <html> (lang + dir) and persist the choice. */
export function applyLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  void i18n.changeLanguage(lang);
}

// Ensure the DOM reflects the initial language on first load.
applyLanguage(getInitialLanguage());

export default i18n;
