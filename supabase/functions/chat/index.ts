// POST /functions/v1/chat
// Body: { analysisId: string, content: string }
//
// Continues the consultation chat. Authoritatively enforces the 300–600 word
// session budget and the 1-hour lock once the budget is exhausted.
import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUser } from '../_shared/supabase.ts';
import { createCompletion, type ChatMessage } from '../_shared/openai.ts';
import { buildChatSystemPrompt } from '../_shared/prompts.ts';
import { RULES, countWords, errorDetail } from '../_shared/rules.ts';

/** Keep only the first `max` words of a string. */
function truncateWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/u);
  return words.length <= max ? text : words.slice(0, max).join(' ');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { analysisId, content } = await req.json();
    if (!analysisId || !content?.trim()) {
      return json({ error: 'analysisId and content are required' }, 400);
    }

    const db = adminClient();
    const lang = (req.headers.get('x-lang') as 'ar' | 'en') ?? 'ar';

    // ── Load session + verify ownership ───────────────────────────────
    const { data: session } = await db
      .from('chat_sessions')
      .select('*')
      .eq('analysis_id', analysisId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!session) return json({ error: 'session_not_found' }, 404);

    // ── Enforce the lock; renew the balance from zero once the hour passes ─
    // When the budget is exhausted we set a 1-hour lock. While the lock is
    // active the chat is closed; once it elapses, the word balance resets to
    // zero and a fresh session begins.
    const now = Date.now();
    let baseWords = session.total_words;
    if (session.locked_until) {
      const lockedUntilMs = new Date(session.locked_until).getTime();
      if (lockedUntilMs > now) {
        return json({ error: 'chat_locked', lockedUntil: lockedUntilMs }, 423);
      }
      baseWords = 0; // hourly renewal — start the balance over
    }

    // ── Load report + recent history for context ──────────────────────
    const { data: analysis } = await db
      .from('analyses')
      .select('report')
      .eq('id', analysisId)
      .single();

    const { data: history } = await db
      .from('chat_messages')
      .select('role, content')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: true })
      .limit(20);

    // ── Persist the user's turn ───────────────────────────────────────
    await db.from('chat_messages').insert({
      analysis_id: analysisId,
      user_id: user.id,
      role: 'user',
      content,
      word_count: countWords(content),
    });

    // ── Build the prompt with the remaining word budget ───────────────
    const remaining = RULES.CHAT_MAX_WORDS - baseWords;
    const messages: ChatMessage[] = [
      { role: 'system', content: buildChatSystemPrompt(analysis?.report ?? {}, remaining, lang) },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
      { role: 'user', content },
    ];

    let reply = await createCompletion({
      messages,
      temperature: 0.6,
      maxTokens: Math.min(600, remaining * 3),
    });

    // ── Authoritatively enforce the budget ────────────────────────────
    let replyWords = countWords(reply);
    if (replyWords > remaining) {
      reply = truncateWords(reply, remaining);
      replyWords = remaining;
    }

    const totalWords = baseWords + replyWords;
    const reachedBudget = totalWords >= RULES.CHAT_MAX_WORDS;
    const lockedUntil = reachedBudget ? new Date(now + RULES.CHAT_LOCK_MS).toISOString() : null;

    // ── Persist the assistant turn + update the session ───────────────
    const { data: message, error: msgErr } = await db
      .from('chat_messages')
      .insert({
        analysis_id: analysisId,
        user_id: user.id,
        role: 'assistant',
        content: reply,
        word_count: replyWords,
      })
      .select('*')
      .single();
    if (msgErr) throw msgErr;

    await db
      .from('chat_sessions')
      .update({ total_words: totalWords, locked_until: lockedUntil })
      .eq('analysis_id', analysisId);

    return json({
      message,
      totalWords,
      locked: reachedBudget,
      lockedUntil: lockedUntil ? new Date(lockedUntil).getTime() : null,
    });
  } catch (err) {
    console.error('[chat]', err);
    return json({ error: 'internal_error', detail: errorDetail(err) }, 500);
  }
});
