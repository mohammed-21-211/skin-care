import { Lightbulb } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Timeline } from '@/components/custom/Timeline';
import { useHistory } from '@/hooks/useHistory';
import { useLanguage } from '@/hooks/useLanguage';

export function HistoryPage() {
  const { t } = useLanguage();
  const { analyses, loading, error } = useHistory();

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-bold">{t('history.title')}</h1>
        <p className="text-muted-foreground">{t('history.subtitle')}</p>
      </div>

      {analyses.length >= 2 && (
        <Alert variant="success" className="items-start">
          <Lightbulb className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{t('history.progressTip')}</p>
            <p className="text-sm opacity-90">{analyses[0].report.summary}</p>
          </div>
        </Alert>
      )}

      {loading ? (
        <div className="grid place-items-center py-16">
          <Spinner className="size-8" />
        </div>
      ) : error ? (
        <Alert variant="destructive">{t('errors.generic')}</Alert>
      ) : (
        <Timeline analyses={analyses} />
      )}
    </div>
  );
}
