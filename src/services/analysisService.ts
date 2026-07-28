import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import type { Analysis, SkinReport } from '@/types';

/** Try to read the `detail` field from a failed Edge Function response body. */
async function readErrorDetail(error: unknown): Promise<string | null> {
  const ctx = (error as { context?: Response }).context;
  if (!ctx || typeof ctx.json !== 'function') return null;
  try {
    const body = await ctx.json();
    return body?.detail ?? body?.error ?? null;
  } catch {
    return null;
  }
}

/** Map a snake_case DB row into the camelCase client `Analysis`. */
function mapRow(row: Record<string, unknown>): Analysis {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    imagePath: row.image_path as string,
    report: row.report as SkinReport,
    createdAt: row.created_at as string,
  };
}

export const analysisService = {
  /**
   * Upload the photo, then ask the `analyze-skin` Edge Function to run the
   * vision model and persist the analysis. The function enforces the 4-hour
   * rate limit server-side and returns the saved row.
   */
  async analyze(userId: string, file: File): Promise<Analysis> {
    const imagePath = await storageService.uploadFacePhoto(userId, file);

    const { data, error } = await supabase.functions.invoke('analyze-skin', {
      body: { imagePath },
      headers: { 'x-lang': localStorage.getItem('skincare.lang') ?? 'ar' },
    });

    if (error) {
      // Edge Function returns 429 with a structured body on rate-limit.
      const ctx = (error as { context?: { status?: number } }).context;
      if (ctx?.status === 429) throw new Error('rateLimited');
      // Surface the real server-side detail (e.g. OpenAI error) when present.
      const detail = await readErrorDetail(error);
      throw new Error(detail || error.message);
    }

    return mapRow(data.analysis as Record<string, unknown>);
  },

  /** Fetch the user's analyses, newest first, for the history timeline. */
  async list(userId: string): Promise<Analysis[]> {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  /**
   * Delete one analysis (and its chat session + messages + stored photo).
   * Runs through the `delete-analysis` Edge Function since deletes are
   * privileged (RLS exposes reads only).
   */
  async remove(analysisId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('delete-analysis', {
      body: { analysisId },
    });
    if (error) throw error;
  },

  /** Resolve a signed display URL for a stored image path. */
  getImageUrl(imagePath: string): Promise<string> {
    return storageService.getSignedUrl(imagePath);
  },
};
