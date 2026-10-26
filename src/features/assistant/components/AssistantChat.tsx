import {
  Check,
  Loader2,
  Mic,
  Search,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

import type { AssistantChatState } from '../hooks/useAssistantChat';
import { AnswerText } from './AnswerText';
import { VoiceConversation } from './VoiceConversation';

const SUGGESTIONS = [
  'Aarav Sharma ki attendance batao',
  'Class 1 me aaj kaun absent hai?',
  'Fee defaulters list',
  'Aaj kitni fees aayi?',
  'Aaj chutti pe kaun hai?',
  'Class 5 A ke teachers kaun hai?',
];

interface AssistantChatProps {
  chat: AssistantChatState;
  /** The small panel of the corner chat button, rather than the full page. */
  compact?: boolean;
}

/**
 * The conversation and the box to ask in: typed, or by voice with one tap on
 * the microphone, which opens the full-screen voice conversation. Used by the
 * Assistant page and by the chat button in the corner of every page.
 */
export function AssistantChat({ chat, compact = false }: AssistantChatProps) {
  const firstName = useAuthStore((state) => state.user?.name.split(' ')[0] ?? '');
  const { messages, blocked, voice, speaker } = chat;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, chat.isAsking]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    chat.send(chat.draft);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chat.send(chat.draft);
    }
  };

  return (
    <>
      <div
        className={cn('flex-1 space-y-4 overflow-y-auto', compact ? 'p-3' : 'p-4 sm:p-6')}
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div
            className={cn(
              'mx-auto flex max-w-xl flex-col items-center text-center',
              compact ? 'py-4' : 'py-8',
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Sparkles className="size-6" aria-hidden />
            </span>
            <h2
              className={cn('mt-4 font-semibold text-slate-900', compact ? 'text-base' : 'text-lg')}
            >
              {firstName
                ? `Namaste ${firstName}, what would you like to know?`
                : 'What would you like to know?'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ask by name, admission number, roll number with class, or a parent’s phone number — or
              tap the mic and just talk.
            </p>
            <div className={cn('flex flex-wrap justify-center gap-2', compact ? 'mt-4' : 'mt-6')}>
              {(compact ? SUGGESTIONS.slice(0, 4) : SUGGESTIONS).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={blocked}
                  onClick={() => chat.send(suggestion)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2 text-sm whitespace-pre-wrap text-white">
                  {message.content}
                </p>
              </div>
            ) : (
              <div key={message.id} className="flex gap-2.5">
                <span
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                    message.error ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600',
                  )}
                >
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0 max-w-[88%] space-y-2">
                  <div
                    className={cn(
                      'rounded-2xl rounded-tl-sm px-4 py-3',
                      message.error ? 'bg-amber-50 text-sm text-amber-800' : 'bg-slate-50',
                    )}
                  >
                    {message.error ? message.content : <AnswerText text={message.content} />}
                  </div>
                  {message.choices && message.question && (
                    <div className="flex flex-wrap gap-2">
                      {message.choices.map((choice) => (
                        <button
                          key={`${choice.pick.kind}-${choice.pick.id}`}
                          type="button"
                          disabled={chat.isAsking}
                          onClick={() =>
                            chat.choose(
                              message.question!,
                              choice.pick,
                              choice.label,
                              Boolean(message.voice),
                            )
                          }
                          className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                        >
                          {choice.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {!message.error && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {speaker.supported && (
                        <button
                          type="button"
                          onClick={() =>
                            speaker.speakingId === message.id
                              ? speaker.stop()
                              : speaker.speak(message.id, message.content)
                          }
                          className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-brand-700"
                        >
                          {speaker.speakingId === message.id ? (
                            <>
                              <Square className="size-3.5" aria-hidden /> Stop
                            </>
                          ) : (
                            <>
                              <Volume2 className="size-3.5" aria-hidden /> Listen
                            </>
                          )}
                        </button>
                      )}
                      {!compact &&
                        message.steps?.map((step, index) => (
                          <span key={index} className="inline-flex items-center gap-1">
                            {step.ok ? (
                              step.tool === 'search_people' ? (
                                <Search className="size-3" aria-hidden />
                              ) : (
                                <Check className="size-3 text-emerald-600" aria-hidden />
                              )
                            ) : (
                              <X className="size-3 text-amber-600" aria-hidden />
                            )}
                            {step.label}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )
        )}

        {chat.isAsking && !chat.voiceMode && (
          <div className="flex gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            </span>
            <p className="rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Looking it up in the school’s records…
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className={cn('border-t border-slate-200 bg-white', compact ? 'p-2.5' : 'p-3 sm:p-4')}
      >
        {voice.error && !chat.voiceMode && (
          <p className="mb-2 text-xs text-amber-700">{voice.error}</p>
        )}
        {chat.voiceNote && !chat.voiceMode && (
          <p className="mb-2 text-xs text-slate-500">{chat.voiceNote}</p>
        )}
        {speaker.speakingId && !chat.voiceMode && (
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-brand-700">
            <Volume2 className="size-3.5 animate-pulse" aria-hidden />
            Speaking the answer…
            <button type="button" onClick={speaker.stop} className="underline hover:text-brand-900">
              Stop
            </button>
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={chat.draft}
            onChange={(event) => chat.type(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={blocked}
            placeholder={
              blocked
                ? 'The assistant is not available here.'
                : compact
                  ? 'Ask anything…'
                  : 'Ask anything — e.g. “Riya Verma ki fees kitni baaki hai?”'
            }
            aria-label="Your question"
            className="max-h-40 min-h-10 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:bg-slate-50"
          />
          {voice.supported && (
            <Button
              type="button"
              variant="outline"
              iconOnly
              disabled={blocked}
              onClick={chat.toggleVoiceMode}
              aria-label="Talk to the assistant"
              title="Talk — tap once, then just keep asking"
              leftIcon={<Mic className="size-4" />}
            />
          )}
          <Button
            type="submit"
            iconOnly
            disabled={blocked || !chat.draft.trim()}
            isLoading={chat.isAsking}
            aria-label="Send"
            title="Send"
            leftIcon={<Send className="size-4" />}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {!voice.supported && <span>Voice needs Chrome or Edge.</span>}
          {speaker.supported && (
            <button
              type="button"
              onClick={() => {
                if (chat.readAloud) speaker.stop();
                chat.setReadAloud(!chat.readAloud);
              }}
              className="inline-flex items-center gap-1 hover:text-slate-800"
              aria-pressed={chat.readAloud}
            >
              {chat.readAloud ? (
                <Volume2 className="size-3.5" aria-hidden />
              ) : (
                <VolumeX className="size-3.5" aria-hidden />
              )}
              {chat.readAloud
                ? 'Spoken questions are answered aloud'
                : 'Answers are not read aloud'}
            </button>
          )}
          {!compact && voice.supported && (
            <span className="ml-auto hidden sm:inline">
              Tap the mic once and keep talking · Enter to send typed questions
            </span>
          )}
        </div>
      </form>

      {chat.voiceMode && <VoiceConversation chat={chat} />}
    </>
  );
}
