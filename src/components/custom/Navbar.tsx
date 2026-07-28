import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import veloraLogo from '@/assets/velora-logo.svg';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
    );

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
      isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center" aria-label={t('common.appName')}>
          <img src={veloraLogo} alt={t('common.appName')} className="h-9 w-auto md:h-10" />
        </Link>

        {/* Desktop nav links (authenticated) */}
        {user && (
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" className={linkClass}>
              {t('nav.dashboard')}
            </NavLink>
            <NavLink to="/analyzer" className={linkClass}>
              {t('nav.analyzer')}
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              {t('nav.history')}
            </NavLink>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Desktop: language + auth */}
          <div className="hidden items-center gap-2 md:flex">
            <LanguageToggle />
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                {t('common.login')}
              </Button>
            )}
          </div>

          {/* Mobile: hamburger toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-border/70 bg-background/95 backdrop-blur md:hidden"
        >
          <div className="container flex animate-fade-in flex-col gap-1 py-3">
            {user ? (
              <>
                <NavLink to="/dashboard" className={mobileLinkClass}>
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink to="/analyzer" className={mobileLinkClass}>
                  {t('nav.analyzer')}
                </NavLink>
                <NavLink to="/history" className={mobileLinkClass}>
                  {t('nav.history')}
                </NavLink>
                <Button variant="ghost" className="mt-1 justify-start" onClick={handleSignOut}>
                  <LogOut />
                  {t('common.logout')}
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/login');
                }}
              >
                {t('common.login')}
              </Button>
            )}

            {/* Language toggle — present whether signed in or not */}
            <div className="mt-1 flex items-center justify-between border-t border-border/70 pt-3">
              <span className="px-1 text-sm text-muted-foreground">{t('common.language')}</span>
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
