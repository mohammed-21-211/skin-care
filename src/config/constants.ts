/**
 * Central place for the business rules described in the spec.
 * Both the front-end (for UX countdowns/labels) and the Edge Functions
 * (for actual enforcement) should reference these numbers.
 */
export const RULES = {
  /** Cooldown between image uploads, in ms. 0 = disabled (no waiting period). */
  IMAGE_UPLOAD_COOLDOWN_MS: 0,

  /** When a chat session ends/limit is reached, the chat locks for 1 hour. */
  CHAT_LOCK_MS: 1 * 60 * 60 * 1000,

  /** Total word budget ("balance") for an AI chat session (assistant words). */
  CHAT_MIN_WORDS: 300,
  CHAT_MAX_WORDS: 600,

  /** Max image upload size accepted by the client before sending. */
  MAX_IMAGE_BYTES: 8 * 1024 * 1024, // 8 MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,

  /** Supabase Storage bucket holding user face photos. */
  STORAGE_BUCKET: 'skin-photos',
} as const;

export const APP = {
  name: 'Velora',
  supportEmail: 'support@velora.app',
} as const;
