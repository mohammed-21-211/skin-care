import { useState } from 'react';
import { ChevronDown, ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkinReportCard } from './SkinReportCard';
import { TimelineImage } from './TimelineImage';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Analysis } from '@/types';

/** Vertical progress timeline of past analyses, newest first, expandable. */
export function Timeline({ analyses }: { analyses: Analysis[] }) {
  const { t, language } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(analyses[0]?.id ?? null);

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-16 text-center text-muted-foreground">
          <ImageOff className="size-10" />
          <p>{t('history.empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ol className="relative space-y-4 border-s-2 border-border ps-6">
      {analyses.map((analysis, index) => {
        const isOpen = openId === analysis.id;
        return (
          <li key={analysis.id} className="relative">
            <span className="absolute -start-[31px] top-3 grid size-4 place-items-center rounded-full border-2 border-primary bg-background">
              <span className="size-2 rounded-full bg-primary" />
            </span>

            <Card>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : analysis.id)}
                className="flex w-full items-center gap-4 p-4 text-start"
              >
                <TimelineImage imagePath={analysis.imagePath} />
                <div className="flex-1">
                  <p className="font-medium">{formatDate(analysis.createdAt, language)}</p>
                  <p className="text-sm text-muted-foreground">{analysis.report.skinType}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {analysis.report.concerns.slice(0, 3).map((c) => (
                      <Badge key={c.key} variant="outline">
                        {c.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                {index === 0 && <Badge variant="success">{t('history.viewReport')}</Badge>}
                <ChevronDown
                  className={cn('size-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className="border-t border-border p-4">
                  <SkinReportCard report={analysis.report} />
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
