import { useEffect, useState } from 'react';
import { analysisService } from '@/services/analysisService';
import { useAuth } from './useAuth';
import type { Analysis } from '@/types';

/** Loads the user's full analysis timeline for the progress page. */
export function useHistory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    analysisService
      .list(user.id)
      .then((data) => active && setAnalyses(data))
      .catch(() => active && setError('generic'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  return { analyses, loading, error };
}
