import { useCallback, useEffect, useState } from 'react';
import { chatService } from '@/services/chatService';
import { RULES } from '@/config/constants';
import type { ChatMessage } from '@/types';

interface State {
  messages: ChatMessage[];
  totalWords: number;
  locked: boolean;
  lockedUntil: number | null;
  sending: boolean;
  error: string | null;
}

/**
 * Manages a single chat session bound to an analysis.
 * Tracks the cumulative assistant word count (the 300–600 budget) and the
 * 1-hour lock state; the Edge Function is the source of truth, this mirrors it.
 */
export function useChat(analysisId: string | null) {
  const [state, setState] = useState<State>({
    messages: [],
    totalWords: 0,
    locked: false,
    lockedUntil: null,
    sending: false,
    error: null,
  });

  useEffect(() => {
    if (!analysisId) return;
    let active = true;
    Promise.all([chatService.history(analysisId), chatService.session(analysisId)])
      .then(([messages, session]) => {
        if (!active) return;
        setState((s) => ({
          ...s,
          messages,
          totalWords: session.totalWords,
          lockedUntil: session.lockedUntil,
          locked:
            session.lockedUntil != null || session.totalWords >= RULES.CHAT_MAX_WORDS,
        }));
      })
      .catch(() => setState((s) => ({ ...s, error: 'generic' })));
    return () => {
      active = false;
    };
  }, [analysisId]);

  const send = useCallback(
    async (content: string) => {
      if (!analysisId || !content.trim() || state.locked) return;

      // Optimistically append the user's message.
      const optimistic: ChatMessage = {
        id: `tmp-${Date.now()}`,
        analysisId,
        role: 'user',
        content,
        wordCount: 0,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, messages: [...s.messages, optimistic], sending: true, error: null }));

      try {
        const result = await chatService.send(analysisId, content);
        setState((s) => ({
          ...s,
          messages: [...s.messages, result.message],
          totalWords: result.totalWords,
          locked: result.locked,
          lockedUntil: result.lockedUntil,
          sending: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'generic';
        setState((s) => ({
          ...s,
          sending: false,
          error: message,
          locked: message === 'chatLocked' ? true : s.locked,
        }));
      }
    },
    [analysisId, state.locked],
  );

  /** Called when the 1-hour lock elapses: the balance renews from zero. */
  const renew = useCallback(
    () =>
      setState((s) =>
        s.locked ? { ...s, locked: false, lockedUntil: null, totalWords: 0, error: null } : s,
      ),
    [],
  );

  const remainingWords = Math.max(0, RULES.CHAT_MAX_WORDS - state.totalWords);

  return { ...state, remainingWords, send, renew };
}
