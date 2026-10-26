import { Maximize2, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { usePlanModules } from '@/features/saas/hooks/useSubscription';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

import { useAssistantChat } from '../hooks/useAssistantChat';
import { AssistantChat } from './AssistantChat';

/**
 * The assistant on every page: a button in the bottom-right corner that
 * opens a small chat panel — typed or spoken, the same conversation as the
 * Assistant page. Shown to the school's staff when the plan includes the
 * assistant, and hidden on the Assistant page itself.
 */
export function AssistantWidget() {
  const { pathname } = useLocation();
  const isPortal = useAuthStore((state) => Boolean(state.user?.is_portal));
  const modules = usePlanModules();
  const [open, setOpen] = useState(false);

  const onAssistantPage =
    pathname === PATHS.assistant || pathname.startsWith(`${PATHS.assistant}/`);
  const allowed = !isPortal && (modules === null || modules.includes('assistant'));

  // Arriving on the Assistant page, the conversation is there in full.
  useEffect(() => {
    if (onAssistantPage) setOpen(false);
  }, [onAssistantPage]);

  if (!allowed || onAssistantPage) return null;

  return (
    <div className="print-hidden">
      {open && <AssistantPanel onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close the assistant' : 'Ask the assistant'}
        title={open ? 'Close' : 'Ask the assistant — type or talk'}
        className={cn(
          'fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition sm:right-6 sm:bottom-6',
          'bg-gradient-to-br from-brand-500 to-purple-600 hover:scale-105 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none',
        )}
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
        {!open && (
          <span
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-400 opacity-20"
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}

/** The open panel. Mounted only while open, so nothing listens or speaks once it is closed. */
function AssistantPanel({ onClose }: { onClose: () => void }) {
  const chat = useAssistantChat();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Esc in a voice conversation ends the conversation, not the panel.
      if (event.key === 'Escape' && !chat.voiceMode) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chat.voiceMode, onClose]);

  return (
    <section
      aria-label="Assistant"
      className={cn(
        'fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-overlay',
        'inset-x-3 top-16 bottom-22 sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[24rem]',
      )}
    >
      <header className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-3 text-white">
        <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Assistant</p>
          <p className="truncate text-xs text-white/80">
            Ask about any student, fees, attendance or results
          </p>
        </div>
        {chat.messages.length > 0 && (
          <button
            type="button"
            onClick={chat.clear}
            className="rounded-md p-1.5 hover:bg-white/15"
            aria-label="New chat"
            title="New chat"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
        <Link
          to={PATHS.assistant}
          className="rounded-md p-1.5 hover:bg-white/15"
          aria-label="Open the full assistant page"
          title="Open full page"
        >
          <Maximize2 className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 hover:bg-white/15"
          aria-label="Close"
          title="Close"
        >
          <X className="size-4" />
        </button>
      </header>

      {chat.unavailable && (
        <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          {chat.unavailable}
        </p>
      )}

      <AssistantChat chat={chat} compact />
    </section>
  );
}
