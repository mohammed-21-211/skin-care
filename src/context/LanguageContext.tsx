import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { applyLanguage, getInitialLanguage } from '@/lib/i18n';
import type { Language } from '@/types';

interface LanguageContextValue {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    applyLanguage(lang);
    setLanguageState(lang);
  }, []);

  const toggle = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, setLanguage]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, dir: language === 'ar' ? 'rtl' : 'ltr', setLanguage, toggle }),
    [language, setLanguage, toggle],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguageContext must be used within <LanguageProvider>');
  return ctx;
}
