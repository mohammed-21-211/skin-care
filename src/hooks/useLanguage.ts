import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '@/context/LanguageContext';

/**
 * One hook for everything language-related: the typed `t()` translator,
 * the current language code, direction, and setters.
 */
export function useLanguage() {
  const { t } = useTranslation();
  const { language, dir, setLanguage, toggle } = useLanguageContext();
  return { t, language, dir, setLanguage, toggle };
}
