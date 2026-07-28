#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  One-shot deploy for the Skin Care AI backend.
#  Prerequisite (run once, interactive — opens your browser):
#       npx supabase login
#  Then:
#       bash deploy.sh
# ──────────────────────────────────────────────────────────────
set -euo pipefail

REF="ezmjxwexhiznbmxklnpz"
SB="npx supabase"

echo "▶ 1/5  Checking login..."
if ! $SB projects list >/dev/null 2>&1; then
  echo "✗ Not logged in. Run:  npx supabase login   then re-run this script."
  exit 1
fi
echo "✓ Logged in."

echo "▶ 2/5  Linking project ($REF)..."
# Will prompt for the database password (Dashboard > Project Settings > Database).
$SB link --project-ref "$REF"

echo "▶ 3/5  Applying database schema (tables, RLS, storage bucket)..."
if ! $SB db push; then
  echo "⚠ db push failed (often the DB password)."
  echo "  Alternative: open the Supabase SQL Editor and run the contents of"
  echo "  supabase/migrations/0001_init.sql, then re-run this script."
  exit 1
fi

echo "▶ 4/5  Setting OpenAI secrets from .env..."
grep -E '^OPENAI_' .env > .env.openai.tmp
$SB secrets set --env-file .env.openai.tmp --project-ref "$REF"
rm -f .env.openai.tmp

echo "▶ 5/5  Deploying Edge Functions..."
$SB functions deploy analyze-skin --project-ref "$REF"
$SB functions deploy chat --project-ref "$REF"

echo
echo "✓ Done. Verifying the endpoint is live..."
code=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  "https://${REF}.supabase.co/functions/v1/analyze-skin")
if [ "$code" = "200" ]; then
  echo "✓ analyze-skin responded 200 to preflight — backend is live. Try uploading an image."
else
  echo "⚠ Preflight returned HTTP $code (expected 200). Give it a few seconds and retry the upload."
fi
