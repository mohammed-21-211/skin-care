import { Link } from 'react-router-dom';
import { Camera, History as HistoryIcon, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const name = user?.email?.split('@')[0] ?? '';

  const cards = [
    {
      to: '/analyzer',
      icon: Camera,
      title: t('nav.analyzer'),
      desc: t('analyzer.uploadPrompt'),
    },
    {
      to: '/history',
      icon: HistoryIcon,
      title: t('nav.history'),
      desc: t('history.subtitle'),
    },
  ];

  return (
    <div className="container space-y-8 py-10">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">
            {t('common.appName')} — {name}
          </h1>
          <p className="text-muted-foreground">{t('common.tagline')}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.to} className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <c.icon className="size-5" />
              </span>
              <CardTitle>{c.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </CardHeader>
            <CardContent>
              <Link to={c.to} className={cn(buttonVariants(), 'w-full')}>
                {c.title}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
