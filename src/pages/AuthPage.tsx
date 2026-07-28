import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

type Mode = 'login' | 'signup';

/** Shared auth screen used for both /login and /signup. */
export function AuthPage({ mode }: { mode: Mode }) {
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setInfo(t('auth.checkEmail'));
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="items-center text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </span>
          <CardTitle className="text-2xl">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.signupTitle')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('common.password')}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
              />
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}
            {info && <Alert variant="success">{info}</Alert>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Spinner className="text-primary-foreground" />}
              {mode === 'login' ? t('common.login') : t('common.signup')}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <Link
              to={mode === 'login' ? '/signup' : '/login'}
              className="font-semibold text-primary hover:underline"
            >
              {mode === 'login' ? t('common.signup') : t('common.login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
