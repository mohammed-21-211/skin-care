<div align="center">

# 🌸 Skin Care AI — منصة العناية الذكية بالبشرة

**AI-powered skin analysis & consultation platform**
**منصة ذكية لتحليل البشرة وتقديم الاستشارات عبر الذكاء الاصطناعي**

[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-3ecf8e)](https://supabase.com)

</div>

---

## 🇸🇦 نظرة عامة (بالعربية)

**سكين كير الذكي** منصة ويب متكاملة للعناية بالبشرة. يرفع المستخدم صورة لوجهه فيقوم
نموذج رؤية حاسوبية بتحليلها وإرجاع تقرير منسّق يشمل: نوع البشرة، المشاكل المكتشفة
(حبوب، جفاف، تصبغات…)، روتين عناية كامل (منتجات + أغذية)، وتحذيرات صريحة عن المكونات
الضارة. بعد التحليل تُفتح محادثة ذكية لمناقشة التقرير ضمن حدود زمنية وحدود كلمات
مضبوطة، مع صفحة سجل لمتابعة تطوّر البشرة عبر الزمن.

**المميزات الأساسية:**
- 🔐 تسجيل دخول وإدارة مستخدمين عبر Supabase Auth.
- 🟢 تحليل صور متقدّم عبر نموذج رؤية (OpenAI) مع تقرير JSON منظّم.
- ⏱️ قيد رفع صورة واحدة كل **4 ساعات** (مفروض من الخادم).
- 💬 محادثة ذكية بحد **300–500 كلمة** ثم قفل تلقائي **ساعتين**.
- 📈 خط زمني لمتابعة التطوّر والمقارنة.
- 🌐 دعم ثنائي اللغة (عربي/إنجليزي) مع ضبط الاتجاه RTL/LTR.
- ☀️ وضع نهاري فقط بتصميم عصري مريح للعين.

## 🇬🇧 Overview (English)

**Skin Care AI** is a full web platform for skin care. A user uploads a face photo;
a vision model analyzes it and returns a structured report: skin type, detected
concerns (acne, dryness, pigmentation…), a complete routine (products + diet), and
explicit ingredient warnings. A smart chat then opens to discuss the report within
strict time and word limits, plus a history page to track progress over time.

---

## 🛠️ Tech Stack | التقنيات

| Layer | Technology | Notes |
| --- | --- | --- |
| Front-End | **React 18 + Vite + TypeScript** | SPA, strict mode, `@/` path alias |
| Styling | **Tailwind CSS** + shadcn-style components | Light mode only, **no inline styles** |
| Icons / Fonts | lucide-react · Google Fonts (Tajawal/Cairo · Inter/Poppins) | Bilingual font stacks |
| i18n | **i18next + react-i18next** | `ar` / `en`, automatic RTL/LTR |
| Auth / DB / Storage | **Supabase** | Auth, Postgres + RLS, private Storage bucket |
| Back-End (APIs) | **Supabase Edge Functions (Deno)** | Server-side OpenAI calls + limit enforcement |
| AI | **OpenAI Vision (configurable model)** | Model id via `OPENAI_MODEL` secret |

> **About the AI model:** the spec requested *GPT-5.5*. The model id is **not hardcoded** —
> it is read from the `OPENAI_MODEL` secret (defaults to `gpt-5.5`). Set it to any
> vision-capable model your account can access. See *Troubleshooting* below.
>
> **About the back-end:** the spec mentioned *Next.js API Routes*. Because the front-end
> is a Vite SPA on Supabase, the equivalent server layer is implemented as **Supabase
> Edge Functions** — this keeps secrets off the client and gives a single deploy target.

---

## 📁 Project Structure | هيكلية المجلدات

```
Skin Care/
├─ index.html                     # Google Fonts + root, dir="rtl" default
├─ src/
│  ├─ components/
│  │  ├─ ui/                       # shadcn-style primitives (Button, Card, Input…)
│  │  └─ custom/                   # shared composites (Navbar, ImageUploader, ChatPanel…)
│  ├─ hooks/                       # useAuth, useLanguage, useSkinAnalysis, useChat…
│  ├─ services/                    # supabaseClient, auth/storage/analysis/chat services
│  ├─ context/                     # AuthContext, LanguageContext
│  ├─ pages/                       # Landing, Auth, Dashboard, Analyzer, History
│  ├─ locales/                     # ar.ts, en.ts translation resources
│  ├─ config/                      # env (validated), constants (business RULES)
│  ├─ lib/                         # utils (cn, countWords, countdown), i18n setup
│  ├─ types/                       # shared domain types (SkinReport, ChatMessage…)
│  └─ styles/                      # globals.css (design tokens, light theme)
└─ supabase/
   ├─ migrations/0001_init.sql     # tables, RLS, storage bucket + policies
   ├─ config.toml
   └─ functions/
      ├─ _shared/                  # cors, supabase, openai, prompts, rules
      ├─ analyze-skin/             # vision analysis + 4-hour rate limit
      └─ chat/                     # consultation chat + 300–500 words + 2-hour lock
```

---

## ⚙️ Installation & Setup | التثبيت والتشغيل

### 1) Prerequisites
- Node.js ≥ 20.19 or ≥ 22.12 (required by Vite 8; tested on 24)
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- (For functions) the [Supabase CLI](https://supabase.com/docs/guides/cli)

### 2) Install
```bash
npm install
```

### 3) Front-end environment
Copy the example and fill in your Supabase values:
```bash
cp .env.example .env
```
```env
VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_DEFAULT_LANGUAGE=ar
```
> Only `VITE_*` variables reach the browser. **Never** put the OpenAI key or the
> service-role key behind a `VITE_` prefix.

### 4) Database & Storage
Apply the schema (creates tables, RLS, and the private `skin-photos` bucket):
```bash
supabase link --project-ref your-ref
supabase db push        # applies supabase/migrations/0001_init.sql
```

### 5) Edge Function secrets (server-side only)
Set **only** the OpenAI secrets. `SUPABASE_URL`, `SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` are injected into Edge Functions automatically —
do not (and cannot) set them yourself; the CLI rejects the `SUPABASE_` prefix.
```bash
supabase secrets set OPENAI_API_KEY=sk-... OPENAI_MODEL=gpt-4o

supabase functions deploy analyze-skin
supabase functions deploy chat
```
> Prefer no CLI? Add the same two secrets in the dashboard:
> **Edge Functions → Secrets** (or **Project Settings → Edge Functions → Secrets**).
> The OpenAI key must never live in `.env` / behind a `VITE_` prefix.

### 6) Run
```bash
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # eslint (0 warnings policy)
```

---

## 🔌 API (Edge Functions)

| Function | Method | Body | Enforces |
| --- | --- | --- | --- |
| `analyze-skin` | POST | `{ imagePath }` | 4-hour upload cooldown · vision analysis · saves report |
| `chat` | POST | `{ analysisId, content }` | 300–500 word budget · 2-hour lock |

Both require a Supabase bearer token and accept an `x-lang: ar|en` header that the
front-end sends automatically so reports/replies come back in the user's language.

---

## 🧩 Troubleshooting / Solved Issues | المشاكل التي تم حلها

### 1) قيد رفع الصور كل 4 ساعات — *Server-authoritative, not client-trusted*
**المشكلة:** منع رفع أكثر من صورة كل 4 ساعات بشكل لا يمكن التحايل عليه من المتصفح.
**الحل:** القرار يُتّخذ داخل `analyze-skin` (Deno): قبل أي تحليل نقرأ أحدث صف في
`analyses` للمستخدم ونحسب الفارق الزمني. إن كان `elapsed < 4h` نُرجع **HTTP 429**
مع `availableAt` (الطابع الزمني للسماح التالي). الواجهة تستخدم هذا الوقت في
`useCountdown` لعرض عدّاد تنازلي حيّ (`CountdownBanner`)، لكن العدّاد للعرض فقط —
الحقيقة عند الخادم. هكذا لا يكفي تعديل وقت الجهاز أو مسح الـ localStorage للتحايل.

```ts
const elapsed = Date.now() - new Date(recent.created_at).getTime();
if (elapsed < RULES.IMAGE_UPLOAD_COOLDOWN_MS)
  return json({ error: 'rate_limited', availableAt }, 429);
```

### 2) قفل المحادثة لمدة ساعتين — *Persistent lock window*
**المشكلة:** بعد انتهاء الحوار يجب قفل الشات ساعتين حتى بعد تحديث الصفحة أو من جهاز آخر.
**الحل:** لكل تحليل صف في `chat_sessions` يحمل `total_words` و`locked_until`. عند بلوغ
حد الكلمات نضبط `locked_until = now + 2h` ونحفظه في قاعدة البيانات. كل طلب لاحق إلى
`chat` يتحقق أولاً: إن كان `locked_until > now` يُرجع **HTTP 423 (Locked)** مع
`lockedUntil`. لأن الحالة مخزّنة في الخادم، يبقى القفل سارياً عبر الجلسات والأجهزة.

### 3) الالتزام بحد 300–500 كلمة + عدّاد الكلمات — *Prompt engineering + hard cap*
**المشكلة:** النماذج اللغوية لا تلتزم بدقة بعدد كلمات عند الطلب فقط.
**الحل بطبقتين:**

1. **هندسة البرومت (إرشاد):** في `buildChatSystemPrompt` نُبلغ النموذج صراحةً بالميزانية
   الكلية (300–500) وبعدد **الكلمات المتبقية في الجلسة**، ونطلب أن يكون طول الردّ
   ضمن `max(40, min(120, remaining))` كلمة، وأن يختم بإيجاز عند اقتراب النفاد.
2. **فرض صارم (ضمان):** بعد ردّ النموذج نحسب عدد كلماته فعلياً (`countWords`، يدعم
   العربية والإنجليزية). إن تجاوز المتبقي **نقتطع** الردّ إلى الحد المسموح
   (`truncateWords`) ونُحدّث `total_words`. عند بلوغ 500 يُقفل الشات تلقائياً.

```ts
let replyWords = countWords(reply);
if (replyWords > remaining) {           // النموذج تجاوز؟ نقتطع بأنفسنا
  reply = truncateWords(reply, remaining);
  replyWords = remaining;
}
const totalWords = session.total_words + replyWords;
const reachedBudget = totalWords >= RULES.CHAT_MAX_WORDS; // → قفل ساعتين
```

**عداد الكلمات للمستخدم:** `ChatPanel` يعرض شريط تقدّم حيّ
(`الكلمات المستخدمة / 500` و«المتبقي»)، ويتحوّل لونه للأخضر عند تجاوز 300 لإظهار أن
الحد الأدنى تحقّق، ثم يتحوّل لبطاقة قفل مع عدّاد تنازلي عند الوصول للحد الأقصى.

### 4) تسرّب المفاتيح — *Keeping secrets off the client*
استدعاءات OpenAI تتم حصراً داخل Edge Functions باستخدام `OPENAI_API_KEY` كـ secret،
ولا يصل المتصفح سوى مفتاح Supabase العام (anon). كل الكتابة في القاعدة تمر عبر
service-role داخل الدوال، بينما RLS يسمح للمستخدم بقراءة صفوفه فقط.

### 5) صورة لنموذج الرؤية — *Signed access without a public bucket*
الصور تُحفظ في bucket **خاص**. الدالة تنزّل الملف بمفتاح service-role وتحوّله إلى
`data:` URL يُمرّر للنموذج، فلا حاجة لجعل الصور عامة. وللعرض في الواجهة نستخدم
**Signed URLs** قصيرة العمر فقط.

### 6) خطأ أنواع i18n عند البناء — *Literal-type mismatch*
**المشكلة:** استخدام `as const` على قاموس العربية جعل كل قيمة **نوعاً حرفياً**، فطلب
TypeScript أن تطابق الإنجليزية نفس النص حرفياً (`error TS2322`).
**الحل:** إزالة `as const` لتتوسّع القيم إلى `string`، مع الإبقاء على بنية المفاتيح
كـ `TranslationSchema` يلتزم بها ملف `en.ts`. يضمن ذلك تطابق المفاتيح دون تطابق النصوص.

### 8) "permission denied for table" من الدالة — *Missing role grants*
**المشكلة:** بعد نجاح تحليل OpenAI، فشل الحفظ بخطأ `permission denied for table analyses`
(وظهر في الواجهة ككائن `[object Object]` لأن خطأ Postgres كائن لا نص).
**السبب:** الجداول أُنشئت لكن دور `service_role` (الذي تعمل به الدوال) ودور
`authenticated` (قراءة العميل) لم يُمنحا صلاحيات الجداول.
**الحل:** مايگريشن [0002_grants.sql](supabase/migrations/0002_grants.sql) يمنح الصلاحيات:
`grant all on … to service_role` و`grant select … to authenticated` (مع بقاء RLS).
كما حُسّنت معالجة الأخطاء في الدوال (`errorDetail`) لتسريد كائنات الأخطاء كنص مقروء.

### 9) "Failed to send a request to the Edge Function" — *CORS / preflight*
**السبب المزدوج:** (أ) الواجهة ترسل ترويسة `x-lang` لم تكن ضمن
`Access-Control-Allow-Headers`؛ (ب) `verify_jwt = true` يجعل البوّابة ترفض الطلب
أحياناً قبل دالتنا فتختفي ترويسات CORS. **الحل:** إضافة `x-lang` لترويسات CORS،
ونشر الدوال بـ `--no-verify-jwt` مع التحقق من المستخدم داخل الدالة عبر `getUser`.

### 7) ثغرات `npm audit` في أدوات التطوير — *Dev-tooling advisories → clean audit*
**المشكلة:** أظهر `npm audit` ثغرتين عاليتين في `esbuild`/`vite` (خاصة بخادم التطوير،
ولا تؤثر على بناء الإنتاج، وبعضها يخص Windows فقط).
**الحل:** الترقية إلى **Vite 8** مع `@vitejs/plugin-react@6`، فأصبح `npm audit` يُظهر
**0 ثغرات**. الإعداد البسيط في `vite.config.ts` لم يتطلّب تعديلاً، ونتج عن المحرّك
الجديد (Rolldown) حزمة أصغر وبناء أسرع. ملاحظة: Vite 8 يتطلب Node ≥ 20.19.

---

## ✅ Quality

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint, 0 warnings
npm run build       # passes ✔
```

## 📜 Disclaimer | تنويه
هذه المنصة لأغراض العناية والتثقيف ولا تُغني عن استشارة طبيب الجلدية للحالات الطبية.
This platform is for skin-care guidance and education and is not a substitute for a
dermatologist's medical advice.
