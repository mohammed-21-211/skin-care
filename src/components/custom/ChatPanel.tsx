import { useEffect, useRef, useState } from 'react';
import { Lock, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { CountdownBanner } from './CountdownBanner';
import { useChat } from '@/hooks/useChat';
import { useLanguage } from '@/hooks/useLanguage';
import { RULES } from '@/config/constants';
import { cn } from '@/lib/utils';

/**
 * Smart chat tied to an analysis. Shows a live word counter against the
 * 300–600 budget, auto-locks for 1 hour when the budget is reached.
 */
export function ChatPanel({ analysisId }: { analysisId: string }) {
  const { t } = useLanguage();
  const { messages, totalWords, remainingWords, locked, lockedUntil, sending, send, renew } =
    useChat(analysisId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, sending]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || sending || locked) return;
    setDraft('');
    void send(text);
  };

  const progressPct = Math.min(100, (totalWords / RULES.CHAT_MAX_WORDS) * 100);
  const reachedMin = totalWords >= RULES.CHAT_MIN_WORDS;

  return (
    <Card className="flex h-[560px] flex-col animate-fade-in">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          {t('chat.title')}
        </CardTitle>

        {/* Word budget meter */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t('chat.wordsUsed')}: <strong className="text-foreground">{totalWords}</strong> /{' '}
              {RULES.CHAT_MAX_WORDS}
            </span>
            <span>
              {t('chat.wordsRemaining')}: {remainingWords}
            </span>
          </div>
          <Progress
            value={progressPct}
            indicatorClassName={cn(reachedMin ? 'bg-success' : 'bg-primary')}
          />
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                m.role === 'user'
                  ? 'rounded-ee-sm bg-primary text-primary-foreground'
                  : 'rounded-es-sm border border-border bg-card',
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5">
              <Spinner className="size-4" />
              <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Composer / lock state */}
      <div className="border-t border-border p-4">
        {locked ? (
          lockedUntil ? (
            <CountdownBanner
              title={t('chat.lockedTitle')}
              description={t('chat.lockedDesc')}
              until={lockedUntil}
              onComplete={renew}
            />
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              <Lock className="size-4" />
              {t('chat.sessionComplete')}
            </div>
          )
        ) : (
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('chat.placeholder')}
              rows={1}
              className="max-h-32"
            />
            <Button size="icon" onClick={handleSend} disabled={sending || !draft.trim()}>
              <Send className="rtl:-scale-x-100" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
