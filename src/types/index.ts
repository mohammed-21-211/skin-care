/** Shared domain types for the platform. */

export type Language = 'ar' | 'en';

export type Severity = 'low' | 'moderate' | 'high';

/** A single detected skin concern. */
export interface SkinConcern {
  /** Stable key, e.g. "acne", "dryness", "hyperpigmentation". */
  key: string;
  label: string;
  severity: Severity;
  description: string;
}

/** A recommended care-routine step. */
export interface RoutineStep {
  title: string;
  detail: string;
  /** "am" | "pm" | "diet" | "lifestyle" */
  category: 'am' | 'pm' | 'diet' | 'lifestyle';
}

/** A warning about ingredients/products to avoid. */
export interface CareWarning {
  title: string;
  reason: string;
  severity: Severity;
}

/** The structured report returned by the AI for one analyzed image. */
export interface SkinReport {
  summary: string;
  skinType: string;
  concerns: SkinConcern[];
  routine: RoutineStep[];
  warnings: CareWarning[];
}

/** A persisted analysis record (DB row, camelCased for the client). */
export interface Analysis {
  id: string;
  userId: string;
  imagePath: string;
  imageUrl?: string;
  report: SkinReport;
  createdAt: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  analysisId: string;
  role: ChatRole;
  content: string;
  /** Word count of this message (assistant messages count toward the budget). */
  wordCount: number;
  createdAt: string;
}

/** Rate-limit status surfaced to the UI for countdowns. */
export interface RateLimitStatus {
  allowed: boolean;
  /** Epoch ms when the action becomes available again, or null if available now. */
  availableAt: number | null;
}
