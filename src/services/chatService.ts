import { supabase } from './supabaseClient';
import type { ChatMessage, ChatRole } from '@/types';

function mapRow(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    analysisId: row.analysis_id as string,
    role: row.role as ChatRole,
    content: row.content as string,
    wordCount: (row.word_count as number) ?? 0,
    createdAt: row.created_at as string,
  };
}

export interface ChatTurnResult {
  message: ChatMessage;
  /** Cumulative assistant word count for this analysis session. */
  totalWords: number;
  /** True once the session hit the word budget and is now locked. */
  locked: boolean;
  /** Epoch ms when the chat unlocks again, if locked. */
  lockedUntil: number | null;
}

export interface ChatSessionState {
  /** Words used in the *current* balance window (post-renewal). */
  totalWords: number;
  /** Epoch ms when the chat unlocks/renews, or null if open now. */
  lockedUntil: number | null;
}

export const chatService = {
  /**
   * Read the live session balance. The word budget renews from zero every hour
   * once it has been exhausted, so we read `chat_sessions` (the source of
   * truth) rather than summing message history — and treat an elapsed lock as
   * a fresh, zeroed balance.
   */
  async session(analysisId: string): Promise<ChatSessionState> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('total_words, locked_until')
      .eq('analysis_id', analysisId)
      .maybeSingle();
    if (error) throw error;

    const lockedUntil = data?.locked_until ? new Date(data.locked_until as string).getTime() : null;
    if (lockedUntil && lockedUntil > Date.now()) {
      return { totalWords: (data?.total_words as number) ?? 0, lockedUntil };
    }
    // No active lock: if one just elapsed, the balance has renewed to zero.
    return { totalWords: lockedUntil ? 0 : ((data?.total_words as number) ?? 0), lockedUntil: null };
  },

  /** Load the message history for an analysis session. */
  async history(analysisId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  /**
   * Send a user turn. The `chat` Edge Function appends the message, calls the
   * model with a word-budget-aware prompt, enforces the 300–600 word limit and
   * the 1-hour lock, and returns the assistant reply plus session state.
   */
  async send(analysisId: string, content: string): Promise<ChatTurnResult> {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { analysisId, content },
      headers: { 'x-lang': localStorage.getItem('skincare.lang') ?? 'ar' },
    });
    if (error) {
      const ctx = (error as { context?: { status?: number } }).context;
      if (ctx?.status === 423) throw new Error('chatLocked');
      throw error;
    }
    return {
      message: mapRow(data.message as Record<string, unknown>),
      totalWords: data.totalWords as number,
      locked: data.locked as boolean,
      lockedUntil: (data.lockedUntil as number | null) ?? null,
    };
  },
};
