// Business rules — kept in sync with src/config/constants.ts.
// The Edge Functions are the *authoritative* enforcer of these limits.
export const RULES = {
  IMAGE_UPLOAD_COOLDOWN_MS: 0, // disabled — no waiting period between uploads
  CHAT_LOCK_MS: 1 * 60 * 60 * 1000, // 1 hour
  CHAT_MIN_WORDS: 300,
  CHAT_MAX_WORDS: 600,
  STORAGE_BUCKET: 'skin-photos',
} as const;

/** Extract a readable message from any thrown value (Error, PostgrestError, etc.). */
export function errorDetail(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    return String(o.message ?? o.error_description ?? o.error ?? JSON.stringify(o));
  }
  return String(err);
}

/** Count words across Arabic + Latin text. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}
