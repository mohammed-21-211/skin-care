import { AlertTriangle, Apple, Droplets, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/useLanguage';
import type { RoutineStep, Severity, SkinReport } from '@/types';

const severityVariant: Record<Severity, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  moderate: 'warning',
  high: 'destructive',
};

const categoryIcon: Record<RoutineStep['category'], typeof Sun> = {
  am: Sun,
  pm: Moon,
  diet: Apple,
  lifestyle: Droplets,
};

/** Renders the structured AI report: summary, concerns, routine, warnings. */
export function SkinReportCard({ report }: { report: SkinReport }) {
  const { t } = useLanguage();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{t('analyzer.reportTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">{report.summary}</p>
        <div className="pt-2">
          <Badge variant="secondary">
            {t('analyzer.skinType')}: {report.skinType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Concerns */}
        <section>
          <h4 className="mb-3 font-display font-semibold">{t('analyzer.concerns')}</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.concerns.map((c) => (
              <div key={c.key} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{c.label}</span>
                  <Badge variant={severityVariant[c.severity]}>{c.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Routine */}
        <section>
          <h4 className="mb-3 font-display font-semibold">{t('analyzer.routine')}</h4>
          <ul className="space-y-2.5">
            {report.routine.map((step, i) => {
              const Icon = categoryIcon[step.category];
              return (
                <li key={i} className="flex gap-3 rounded-xl border border-border p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Warnings */}
        <section>
          <h4 className="mb-3 flex items-center gap-2 font-display font-semibold">
            <AlertTriangle className="size-4 text-warning" />
            {t('analyzer.warnings')}
          </h4>
          {report.warnings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('analyzer.noWarnings')}</p>
          ) : (
            <div className="space-y-2">
              {report.warnings.map((w, i) => (
                <Alert key={i} variant="warning" className="items-start">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-semibold">{w.title}</p>
                    <p className="text-sm opacity-90">{w.reason}</p>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
