import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useLanguage } from '@/hooks/useLanguage';

/** App chrome: navbar + routed content + footer. */
export function Layout() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/70 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t('common.appName')}
      </footer>
    </div>
  );
}
