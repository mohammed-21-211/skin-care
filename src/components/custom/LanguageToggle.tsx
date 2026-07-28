import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

/** Toggles between Arabic and English (and flips document direction). */
export function LanguageToggle() {
  const { language, toggle } = useLanguage();
  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-label="Toggle language">
      <Languages />
      <span className="font-semibold">{language === 'ar' ? 'EN' : 'عربي'}</span>
    </Button>
  );
}
