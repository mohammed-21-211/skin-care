import { Clock } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCountdown } from '@/lib/utils';

interface CountdownBannerProps {
  title: string;
  description: string;
  /** Epoch ms when the gate lifts. */
  until: number;
  onComplete?: () => void;
}

/** Reusable countdown banner for time-gated states (e.g. the chat lock). */
export function CountdownBanner({ title, description, until, onComplete }: CountdownBannerProps) {
  const { language } = useLanguage();
  const { remaining, done } = useCountdown(until);

  if (done) {
    onComplete?.();
    return null;
  }

  return (
    <Alert variant="warning" className="items-start">
      <Clock className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-90">{description}</p>
        <p className="font-display text-lg font-bold tabular-nums">
          {formatCountdown(remaining, language)}
        </p>
      </div>
    </Alert>
  );
}
