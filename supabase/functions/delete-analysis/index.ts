// POST /functions/v1/delete-analysis
// Body: { analysisId: string }
//
// Deletes a single analysis the caller owns, along with its chat session and
// messages (removed via ON DELETE CASCADE) and the stored face photo.
import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUser } from '../_shared/supabase.ts';
import { RULES, errorDetail } from '../_shared/rules.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { analysisId } = await req.json();
    if (!analysisId || typeof analysisId !== 'string') {
      return json({ error: 'analysisId is required' }, 400);
    }

    const db = adminClient();

    // ── Verify ownership before deleting anything ─────────────────────
    const { data: analysis } = await db
      .from('analyses')
      .select('id, user_id, image_path')
      .eq('id', analysisId)
      .maybeSingle();
    if (!analysis || analysis.user_id !== user.id) {
      return json({ error: 'not_found' }, 404);
    }

    // ── Remove the stored face photo (best-effort) ────────────────────
    if (analysis.image_path) {
      await db.storage.from(RULES.STORAGE_BUCKET).remove([analysis.image_path]);
    }

    // ── Delete the analysis; chat_sessions + chat_messages cascade ────
    const { error: delErr } = await db.from('analyses').delete().eq('id', analysisId);
    if (delErr) throw delErr;

    return json({ ok: true });
  } catch (err) {
    console.error('[delete-analysis]', err);
    return json({ error: 'internal_error', detail: errorDetail(err) }, 500);
  }
});
