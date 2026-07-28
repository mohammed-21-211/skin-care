// Prompt engineering for both Edge Functions.
import { RULES } from './rules.ts';
import type { ChatMessage } from './openai.ts';

type Lang = 'ar' | 'en';

/**
 * Vision analysis: instruct the model to return a strict JSON object that
 * matches the front-end `SkinReport` type, written in the user's language.
 */
export function buildAnalysisMessages(imageUrl: string, lang: Lang): ChatMessage[] {
  const language = lang === 'ar' ? 'Arabic' : 'English';

  const system = `You are a careful dermatology-aware skin care assistant.
Analyze the provided face photo and produce a STRICT JSON object (no markdown, no commentary).
Write all human-readable text in ${language}.

Return exactly this shape:
{
  "summary": string,                       // 1-2 sentence overview
  "skinType": string,                      // e.g. oily / dry / combination / normal / sensitive
  "concerns": [                            // detected issues, most significant first
    { "key": string, "label": string, "severity": "low"|"moderate"|"high", "description": string }
  ],
  "routine": [                             // actionable steps
    { "title": string, "detail": string, "category": "am"|"pm"|"diet"|"lifestyle" }
  ],
  "warnings": [                            // ingredients/products to avoid for THIS skin
    { "title": string, "reason": string, "severity": "low"|"moderate"|"high" }
  ]
}

Rules:
- Base every observation only on what is visible; never invent a medical diagnosis.
- Always include at least 2 routine items covering skincare AND healthy diet.
- Include warnings about ingredients that could worsen the detected condition.
- Add a gentle note in "summary" to consult a dermatologist for medical concerns.`;

  return [
    { role: 'system', content: system },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this face photo and return the JSON report.' },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
  ];
}

/**
 * Chat system prompt. The session has a hard 300–600 word budget across ALL
 * assistant replies. We tell the model how many words remain and instruct it
 * to wrap up cleanly as the budget runs out — the function still hard-enforces.
 */
export function buildChatSystemPrompt(
  report: unknown,
  remainingWords: number,
  lang: Lang,
): string {
  const language = lang === 'ar' ? 'Arabic' : 'English';
  const targetThisReply = Math.max(40, Math.min(120, remainingWords));

  return `You are the skin care assistant continuing a consultation about the user's analyzed photo.
Reply in ${language}. Be warm, specific, and practical.

Here is the structured report you already produced (JSON):
${JSON.stringify(report)}

WORD BUDGET — IMPORTANT:
- The ENTIRE chat session is limited to ${RULES.CHAT_MIN_WORDS}-${RULES.CHAT_MAX_WORDS} words of assistant text in total.
- Words remaining in this session: ${remainingWords}.
- Keep THIS reply around ${targetThisReply} words; never exceed the remaining budget.
- If remaining words are low, give a concise closing summary and politely tell the user the session is ending.
Do not mention token or word counts explicitly unless the user asks.`;
}
