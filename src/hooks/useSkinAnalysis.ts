import { useCallback, useEffect, useState } from 'react';
import { analysisService } from '@/services/analysisService';
import { validateImage } from '@/services/storageService';
import { RULES } from '@/config/constants';
import { useAuth } from './useAuth';
import type { Analysis } from '@/types';

interface State {
  analyses: Analysis[];
  current: Analysis | null;
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  /** Epoch ms when the next upload is allowed, or null if allowed now. */
  cooldownUntil: number | null;
}

/**
 * Drives the analyzer screen: loads past analyses, computes the client-side
 * upload cooldown (currently disabled — see RULES.IMAGE_UPLOAD_COOLDOWN_MS),
 * and runs a new analysis.
 */
export function useSkinAnalysis() {
  const { user } = useAuth();
  const [state, setState] = useState<State>({
    analyses: [],
    current: null,
    loading: true,
    analyzing: false,
    error: null,
    cooldownUntil: null,
  });

  const computeCooldown = useCallback((analyses: Analysis[]): number | null => {
    if (RULES.IMAGE_UPLOAD_COOLDOWN_MS <= 0 || analyses.length === 0) return null;
    const last = new Date(analyses[0].createdAt).getTime();
    const until = last + RULES.IMAGE_UPLOAD_COOLDOWN_MS;
    return until > Date.now() ? until : null;
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const analyses = await analysisService.list(user.id);
      setState((s) => ({
        ...s,
        analyses,
        current: analyses[0] ?? null,
        cooldownUntil: computeCooldown(analyses),
        loading: false,
        error: null,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'generic' }));
    }
  }, [user, computeCooldown]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const analyze = useCallback(
    async (file: File) => {
      if (!user) return;
      const validationError = validateImage(file);
      if (validationError) {
        setState((s) => ({ ...s, error: validationError }));
        return;
      }
      setState((s) => ({ ...s, analyzing: true, error: null }));
      try {
        const analysis = await analysisService.analyze(user.id, file);
        setState((s) => {
          const analyses = [analysis, ...s.analyses];
          return {
            ...s,
            analyses,
            current: analysis,
            analyzing: false,
            cooldownUntil: computeCooldown(analyses),
          };
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'generic';
        setState((s) => ({ ...s, analyzing: false, error: message }));
      }
    },
    [user, computeCooldown],
  );

  const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), []);

  /**
   * Open a specific past session, or pass `null` to start a fresh chat
   * (clears the selection so the uploader is shown again).
   */
  const select = useCallback(
    (analysis: Analysis | null) => setState((s) => ({ ...s, current: analysis, error: null })),
    [],
  );

  /**
   * Delete one analysis/chat session. If it was the open one, fall back to the
   * newest remaining session (or the new-chat view when none are left).
   */
  const remove = useCallback(
    async (analysisId: string) => {
      try {
        await analysisService.remove(analysisId);
        setState((s) => {
          const analyses = s.analyses.filter((a) => a.id !== analysisId);
          const current = s.current?.id === analysisId ? (analyses[0] ?? null) : s.current;
          return { ...s, analyses, current, cooldownUntil: computeCooldown(analyses), error: null };
        });
      } catch {
        setState((s) => ({ ...s, error: 'generic' }));
      }
    },
    [computeCooldown],
  );

  return { ...state, analyze, refresh, clearError, select, remove };
}
