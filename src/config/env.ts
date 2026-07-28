/**
 * Typed, validated access to front-end environment variables.
 * Throws early (at module load) with a clear message if something is missing,
 * so misconfiguration surfaces immediately instead of as a cryptic runtime error.
 */
type Language = 'ar' | 'en';

function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable "${key}". ` +
        'Copy .env.example to .env and fill it in.',
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  defaultLanguage: ((import.meta.env.VITE_DEFAULT_LANGUAGE as Language) || 'ar') satisfies Language,
} as const;
