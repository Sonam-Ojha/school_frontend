import { Mic, VolumeX, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

import type { AssistantChatState } from '../hooks/useAssistantChat';
import { AnswerText } from './AnswerText';
import { VoiceOrb } from './VoiceOrb';

const PHASE_LABEL = {
  listening: 'Listening…',
  thinking: 'Looking it up…',
  speaking: 'Speaking…',
  waiting: 'One moment…',
} as const;

/**
 * A voice conversation, full screen, the way ChatGPT's voice mode looks: the
 * orb in the middle, what was heard under it as it is heard, then the answer
 * as it is spoken. Ends with the button at the bottom, Esc, or "bas".
 */
export function VoiceConversation({ chat }: { chat: AssistantChatState }) {
  const { phase, pulse, voice, speaker, lang, setLang, messages, endVoiceMode, pending, choose } =
    chat;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') endVoiceMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [endVoiceMode]);

  const lastQuestion = [...messages].reverse().find((message) => message.role === 'user');
  const lastIndex = messages.length - 1;
  const answer = messages[lastIndex]?.role === 'assistant' ? messages[lastIndex] : null;
  const heard = voice.listening ? voice.interim : (lastQuestion?.content ?? '');
  const open = pending();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice conversation with the assistant"
      // A click anywhere lets a browser that blocked speech speak the next answer.
      onClick={speaker.unlock}
      className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-white via-brand-50 to-white"
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-sm font-semibold text-slate-700">Voice assistant</p>
        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs"
            role="radiogroup"
            aria-label="Voice language"
          >
            {(
              [
                ['en-IN', 'English'],
                ['hi-IN', 'हिंदी'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={lang === value}
                onClick={() => setLang(value)}
                className={cn(
                  'rounded px-2.5 py-1',
                  lang === value
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => endVoiceMode()}
            className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close the voice conversation"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 pb-4">
        <VoiceOrb phase={phase} pulse={pulse} />

        <div
          className="flex items-center gap-2 text-sm font-medium text-brand-700"
          aria-live="polite"
        >
          {phase === 'listening' && (
            <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden />
          )}
          {PHASE_LABEL[phase]}
          {phase === 'listening' && lang === 'hi-IN' && (
            <span className="text-slate-500">(Hindi)</span>
          )}
        </div>

        <div className="w-full max-w-xl space-y-4 text-center">
          {heard && (
            <p
              className={cn(
                'text-lg font-medium text-slate-900 sm:text-xl',
                voice.listening && 'text-slate-600',
              )}
            >
              “{heard}”
            </p>
          )}
          {answer && phase !== 'listening' && phase !== 'thinking' && (
            <div className="mx-auto max-h-56 overflow-y-auto rounded-2xl bg-white/80 px-4 py-3 text-left shadow-sm ring-1 ring-slate-200">
              {answer.error ? (
                <p className="text-sm text-amber-800">{answer.content}</p>
              ) : (
                <AnswerText text={answer.content} />
              )}
            </div>
          )}
          {open && (
            <div className="flex flex-wrap justify-center gap-2">
              {open.choices!.map((choice) => (
                <button
                  key={`${choice.pick.kind}-${choice.pick.id}`}
                  type="button"
                  onClick={() => choose(open.question!, choice.pick, choice.label, true)}
                  className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}
          {speaker.blocked && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-amber-700">
              <VolumeX className="size-3.5" aria-hidden />
              The browser didn’t let the page speak. Click anywhere on this screen once, and the
              next answer will be spoken.
            </p>
          )}
          {voice.error && <p className="text-xs text-amber-700">{voice.error}</p>}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pb-8">
        <button
          type="button"
          onClick={() => endVoiceMode()}
          className="flex size-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 focus-visible:ring-4 focus-visible:ring-red-200 focus-visible:outline-none"
          aria-label="End the voice conversation"
        >
          <X className="size-7" />
        </button>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <Mic className="size-3.5" aria-hidden />
          Just keep talking — say “bas” or press Esc to stop
        </p>
      </div>
    </div>,
    document.body,
  );
}
