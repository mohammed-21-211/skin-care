import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names and de-duplicate conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Count words in a string (handles Arabic + Latin, collapses whitespace). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}

/** Format a millisecond duration as a human "Xh Ym" / "Xس Yد" countdown. */
export function formatCountdown(ms: number, lang: 'ar' | 'en' = 'ar'): string {
  if (ms <= 0) return lang === 'ar' ? 'الآن' : 'now';
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (lang === 'ar') {
    const h = hours ? `${hours} ساعة` : '';
    const m = minutes ? `${minutes} دقيقة` : '';
    return [h, m].filter(Boolean).join(' و ') || 'أقل من دقيقة';
  }
  const h = hours ? `${hours}h` : '';
  const m = minutes ? `${minutes}m` : '';
  return [h, m].filter(Boolean).join(' ') || '<1m';
}

/** Format an ISO date string for display in the given locale. */
export function formatDate(iso: string, lang: 'ar' | 'en' = 'ar'): string {
  return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
