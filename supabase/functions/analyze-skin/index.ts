// POST /functions/v1/analyze-skin
// Body: { imagePath: string }
//
// Optionally enforces an upload cooldown (disabled by default), runs the vision
// model on the uploaded photo, persists the structured report, and opens a chat
// session.
import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUser } from '../_shared/supabase.ts';
import { createCompletion } from '../_shared/openai.ts';
import { buildAnalysisMessages } from '../_shared/prompts.ts';
import { RULES, errorDetail } from '../_shared/rules.ts';

/** Base64-encode bytes in chunks to avoid a stack overflow on large images. */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000; // 32 KB per chunk
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { imagePath } = await req.json();
    if (!imagePath || typeof imagePath !== 'string') {
      return json({ error: 'imagePath is required' }, 400);
    }

    const db = adminClient();

    // ── Rate limit: optional cooldown between uploads (0 = disabled) ───
    if (RULES.IMAGE_UPLOAD_COOLDOWN_MS > 0) {
      const { data: recent } = await db
        .from('analyses')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent) {
        const elapsed = Date.now() - new Date(recent.created_at).getTime();
        if (elapsed < RULES.IMAGE_UPLOAD_COOLDOWN_MS) {
          return json(
            { error: 'rate_limited', availableAt: new Date(recent.created_at).getTime() + RULES.IMAGE_UPLOAD_COOLDOWN_MS },
            429,
          );
        }
      }
    }

    // ── Read the uploaded image and inline it as a data URL for the model.
    const { data: file, error: dlErr } = await db.storage
      .from(RULES.STORAGE_BUCKET)
      .download(imagePath);
    if (dlErr || !file) return json({ error: 'image_not_found' }, 404);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = bytesToBase64(bytes);
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;

    const lang = (req.headers.get('x-lang') as 'ar' | 'en') ?? 'ar';

    // ── Vision analysis → strict JSON report ──────────────────────────
    const raw = await createCompletion({
      messages: buildAnalysisMessages(dataUrl, lang),
      json: true,
      temperature: 0.4,
      maxTokens: 1400,
    });

    let report: unknown;
    try {
      report = JSON.parse(raw);
    } catch {
      return json({ error: 'model_invalid_json' }, 502);
    }

    // ── Persist analysis + open a fresh chat session ──────────────────
    const { data: analysis, error: insErr } = await db
      .from('analyses')
      .insert({ user_id: user.id, image_path: imagePath, report })
      .select('*')
      .single();
    if (insErr) throw insErr;

    await db.from('chat_sessions').insert({
      analysis_id: analysis.id,
      user_id: user.id,
      total_words: 0,
    });

    return json({ analysis });
  } catch (err) {
    console.error('[analyze-skin]', err);
    return json({ error: 'internal_error', detail: errorDetail(err) }, 500);
  }
});
