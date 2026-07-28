import { useState } from 'react';
import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/custom/ImageUploader';
import { SkinReportCard } from '@/components/custom/SkinReportCard';
import { ChatPanel } from '@/components/custom/ChatPanel';
import { ChatSidebar } from '@/components/custom/ChatSidebar';
import { CountdownBanner } from '@/components/custom/CountdownBanner';
import { useSkinAnalysis } from '@/hooks/useSkinAnalysis';
import { useLanguage } from '@/hooks/useLanguage';

export function AnalyzerPage() {
  const { t } = useLanguage();
  const { analyses, current, loading, analyzing, error, cooldownUntil, analyze, refresh, clearError, select, remove } =
    useSkinAnalysis();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const onCooldown = cooldownUntil !== null;

  return (
    <div className="container space-y-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{t('analyzer.title')}</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 lg:hidden"
          onClick={() => setSidebarOpen((o) => !o)}
        >
          <History className="size-4" />
          {t('chat.historyTitle')}
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ChatSidebar
          sessions={analyses}
          currentId={current?.id ?? null}
          onSelect={(a) => {
            select(a);
            setSidebarOpen(false);
          }}
          onNew={() => {
            select(null);
            setSidebarOpen(false);
          }}
          onDelete={remove}
          open={sidebarOpen}
        />

        <div className="grid min-w-0 flex-1 gap-6 lg:grid-cols-2">
        {/* Left: upload + report */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('analyzer.uploadButton')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {onCooldown && (
                <CountdownBanner
                  title={t('analyzer.cooldownTitle')}
                  description={t('analyzer.cooldownDesc')}
                  until={cooldownUntil}
                  onComplete={refresh}
                />
              )}

              {error && (
                <Alert variant="destructive" className="cursor-pointer" onClick={clearError}>
                  {t(`errors.${error}`) === `errors.${error}`
                    ? error /* not a known key — show the raw server detail */
                    : t(`errors.${error}` as 'errors.generic')}
                </Alert>
              )}

              <ImageUploader disabled={onCooldown} analyzing={analyzing} onAnalyze={analyze} />
            </CardContent>
          </Card>

          {current && <SkinReportCard report={current.report} />}
        </div>

        {/* Right: chat — opens automatically once an analysis exists */}
        <div>
          {current ? (
            <ChatPanel key={current.id} analysisId={current.id} />
          ) : (
            <Card className="grid h-full min-h-[300px] place-items-center">
              <CardContent className="py-10 text-center text-muted-foreground">
                {t('analyzer.uploadPrompt')}
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
