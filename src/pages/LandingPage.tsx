import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, HeartPulse, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

const FEATURE_ICONS = [Eye, HeartPulse, ShieldAlert, TrendingUp];

export function LandingPage() {
  const { t, dir } = useLanguage();
  const { user } = useAuth();

  const features = [1, 2, 3, 4].map((n, i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`landing.feature${n}Title`),
    desc: t(`landing.feature${n}Desc`),
  }));

  const tips: { ar: string; en: string }[] = [
    { ar: 'اشربي ٨ أكواب ماء يومياً لترطيب البشرة من الداخل.', en: 'Drink 8 glasses of water daily to hydrate skin from within.' },
    { ar: 'استخدمي واقي شمس SPF 30+ يومياً حتى في الأيام الغائمة.', en: 'Use SPF 30+ sunscreen daily, even on cloudy days.' },
    { ar: 'نظّفي وجهك مرتين يومياً بمنظّف لطيف خالٍ من العطور.', en: 'Cleanse twice daily with a gentle, fragrance-free cleanser.' },
    { ar: 'نامي ٧–٨ ساعات؛ النوم الجيد يجدّد خلايا البشرة.', en: 'Sleep 7–8 hours; good sleep renews skin cells.' },
  ];

  const lang = dir === 'rtl' ? 'ar' : 'en';

  return (
    <div className="container space-y-24 py-12 md:py-20">
      {/* Hero */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            {t('common.tagline')}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('landing.heroSubtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Link to={user ? '/analyzer' : '/signup'} className={cn(buttonVariants({ size: 'lg' }))}>
              {t('landing.ctaPrimary')}
              <ArrowLeft className="ltr:-scale-x-100" />
            </Link>
            <a href="#features" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
              {t('landing.ctaSecondary')}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-secondary via-accent to-primary/20 blur-2xl" />
          <div className="glass-card aspect-square overflow-hidden p-2">
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1100&q=80"
              alt={t('landing.heroTitle')}
              loading="eager"
              className="size-full rounded-xl object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = 'none';
                el.parentElement?.classList.add(
                  'grid',
                  'place-items-center',
                  'bg-gradient-to-br',
                  'from-primary/15',
                  'via-accent',
                  'to-secondary',
                );
              }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-8">
        <h2 className="text-center font-display text-3xl font-bold">{t('landing.featuresTitle')}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="text-center transition-transform hover:-translate-y-1">
              <CardContent className="space-y-3 p-6">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="size-6" />
                </span>
                <h3 className="font-display font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-8">
        <h2 className="text-center font-display text-3xl font-bold">{t('landing.tipsTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tips.map((tip, i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-3 p-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground">
                  {i + 1}
                </span>
                <p className="text-muted-foreground">{tip[lang]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-[hsl(14_42%_38%)] p-10 text-center text-primary-foreground md:p-16">
        <h2 className="font-display text-3xl font-bold">{t('landing.heroTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl opacity-90">{t('landing.heroSubtitle')}</p>
        <Link
          to={user ? '/analyzer' : '/signup'}
          className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), 'mt-6')}
        >
          {t('landing.ctaPrimary')}
        </Link>
      </section>
    </div>
  );
}
