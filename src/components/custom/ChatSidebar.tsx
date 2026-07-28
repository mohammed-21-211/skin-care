import { useState } from 'react';
import { Check, History, MessageSquarePlus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Analysis } from '@/types';

interface ChatSidebarProps {
  /** Past chat sessions (one per analysis), newest first. */
  sessions: Analysis[];
  /** Id of the session currently open, or null when starting a new chat. */
  currentId: string | null;
  onSelect: (analysis: Analysis) => void;
  onNew: () => void;
  /** Delete a session (analysis + its chat). Resolves when done. */
  onDelete: (analysisId: string) => Promise<void>;
  /** Controls visibility on small screens (always shown on lg+). */
  open: boolean;
}

/**
 * Side rail for the analyzer: a "new chat" action plus the history of past
 * consultation sessions. Each analysis is one chat session, so the history
 * mirrors the user's analyses. Each row can be deleted (with an inline
 * confirm step).
 */
export function ChatSidebar({
  sessions,
  currentId,
  onSelect,
  onNew,
  onDelete,
  open,
}: ChatSidebarProps) {
  const { t, language } = useLanguage();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <aside className={cn('w-full shrink-0 lg:block lg:w-64', open ? 'block' : 'hidden')}>
      <div className="space-y-4 lg:sticky lg:top-20">
        <Button className="w-full justify-start gap-2" onClick={onNew}>
          <MessageSquarePlus className="size-4" />
          {t('chat.newChat')}
        </Button>

        <div>
          <p className="flex items-center gap-1.5 px-2 pb-2 text-xs font-medium text-muted-foreground">
            <History className="size-3.5" />
            {t('chat.historyTitle')}
          </p>

          {sessions.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{t('chat.historyEmpty')}</p>
          ) : (
            <ul className="space-y-1">
              {sessions.map((s) => {
                const active = s.id === currentId;
                const confirming = confirmId === s.id;
                const deleting = deletingId === s.id;
                return (
                  <li key={s.id}>
                    <div
                      className={cn(
                        'flex items-center gap-1 rounded-lg pe-1 transition-colors',
                        active ? 'bg-primary/10' : 'hover:bg-muted',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(s)}
                        aria-current={active}
                        className={cn(
                          'min-w-0 flex-1 rounded-lg px-3 py-2 text-start',
                          active ? 'text-primary' : 'text-foreground',
                        )}
                      >
                        <span className="block truncate text-sm font-medium">
                          {s.report.skinType || s.report.summary}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatDate(s.createdAt, language)}
                        </span>
                      </button>

                      {confirming ? (
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            disabled={deleting}
                            aria-label={t('chat.confirmDelete')}
                            className="grid size-7 place-items-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                          >
                            {deleting ? (
                              <Spinner className="size-4" />
                            ) : (
                              <Check className="size-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={deleting}
                            aria-label={t('common.cancel')}
                            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(s.id)}
                          aria-label={t('chat.deleteChat')}
                          title={t('chat.deleteChat')}
                          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
