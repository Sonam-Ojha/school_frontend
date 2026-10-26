import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { schoolCode } from '@/app/tenant';
import { toApiError } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

import { choiceFromReply, choicesSpeech } from '../choosing';
import { assistantService } from '../services/assistantService';
import type { AssistantContext, AssistantPerson, ChatMessage, VoiceLang } from '../types';
import { languageOf, useSpeaker, useVoiceInput } from './useVoice';

/**
 * One conversation with the assistant, typed or spoken, used by both the
 * Assistant page and the chat button in the corner of every page. The
 * conversation is kept for the browser tab, so it carries on from one to
 * the other; what the last answer was about goes with the next question, so
 * "aur uski fees?" follows on.
 *
 * A voice conversation starts with one tap: it listens, answers aloud and
 * listens again, until the microphone is tapped again, "bas" is said, the
 * person starts typing, or nobody speaks twice running.
 */

const HISTORY_SENT = 20;
const storageKey = `assistant-chat:${schoolCode ?? 'school'}`;

interface SavedChat {
  messages: ChatMessage[];
  context: AssistantContext | null;
}

function loadChat(): SavedChat {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as
      SavedChat | ChatMessage[] | null;
    if (Array.isArray(saved)) return { messages: saved, context: null };
    return saved ?? { messages: [], context: null };
  } catch {
    return { messages: [], context: null };
  }
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Said on its own, ends a voice conversation. */
const STOP_WORDS =
  /^(stop|stop it|bas|bas karo|bas kijiye|band|band karo|ruko|rukiye|khatam|cancel|exit|enough|that'?s all|thank you|thanks|dhanyavad|dhanyawad|shukriya|बस|बस करो|बस कीजिए|बंद|बंद करो|रुको|रुकिए|ख़त्म|खत्म|धन्यवाद|शुक्रिया)[\s.!।]*$/i;

/** Whether spoken questions are answered aloud: on unless this person turned it off. */
const READ_ALOUD_KEY = 'assistant-read-aloud';
function loadReadAloud(): boolean {
  try {
    return localStorage.getItem(READ_ALOUD_KEY) !== '0';
  } catch {
    return true;
  }
}

/** The language voice input listens in, as this person last chose. */
const LANG_KEY = 'assistant-voice-lang';
function loadLang(): VoiceLang {
  try {
    return localStorage.getItem(LANG_KEY) === 'hi-IN' ? 'hi-IN' : 'en-IN';
  } catch {
    return 'en-IN';
  }
}

/** What a voice conversation is doing now, for the orb. */
export type VoicePhase = 'listening' | 'thinking' | 'speaking' | 'waiting';

export function useAssistantChat() {
  const isPortal = useAuthStore((state) => Boolean(state.user?.is_portal));

  const status = useQuery({
    queryKey: queryKeys.assistant.status(),
    queryFn: ({ signal }) => assistantService.status(signal),
    enabled: !isPortal,
    staleTime: 60_000,
    meta: { skipGlobalError: true },
  });
  const unavailable = status.data && !status.data.available ? status.data.reason : null;
  const blocked = isPortal || Boolean(unavailable) || status.isError;

  const [saved] = useState(loadChat);
  const [messages, setMessages] = useState<ChatMessage[]>(saved.messages);
  const [context, setContext] = useState<AssistantContext | null>(saved.context);
  const [draft, setDraft] = useState('');
  const [lang, setLang] = useState<VoiceLang>(loadLang);
  const [readAloud, setReadAloud] = useState(loadReadAloud);
  const speaker = useSpeaker();

  const [voiceMode, setVoiceMode] = useState(false);
  const voiceModeRef = useRef(false);
  const silences = useRef(0);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  /** Goes up at each word heard or spoken: the orb pulses with it. */
  const [pulse, setPulse] = useState(0);
  const beat = () => setPulse((value) => value + 1);
  /** Listens again while in a voice conversation; set once the microphone hook exists (below). */
  const listen = useRef<() => void>(() => undefined);

  useEffect(() => {
    try {
      localStorage.setItem(READ_ALOUD_KEY, readAloud ? '1' : '0');
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Not kept: the defaults apply next time.
    }
  }, [readAloud, lang]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ messages: messages.slice(-40), context }),
      );
    } catch {
      // A private window or full storage: the conversation simply is not kept.
    }
  }, [messages, context]);

  const ask = useMutation({
    mutationFn: ({
      history,
      voice,
      pick,
    }: {
      history: ChatMessage[];
      voice: boolean;
      question: string;
      pick?: AssistantPerson;
    }) =>
      assistantService.ask({
        messages: history
          .filter((message) => !message.error)
          .slice(-HISTORY_SENT)
          .map(({ role, content }) => ({ role, content })),
        voice,
        context,
        pick,
      }),
    meta: { skipGlobalError: true },
    onSuccess: (reply, { voice, question }) => {
      const id = newId();
      const choices = reply.choices?.length ? reply.choices : undefined;
      setMessages((current) => [
        ...current,
        {
          id,
          role: 'assistant',
          content: reply.answer,
          steps: reply.steps,
          choices,
          question: choices ? question : undefined,
          voice: choices ? voice : undefined,
        },
      ]);
      setContext(reply.context ?? null);
      if (!voice) return;
      // Asked aloud, answered aloud — then the microphone opens again for the next question.
      // "Which one?" is read with its choices, so the reply can be "pehla" or "class 5 wala".
      if (!readAloud || !speaker.supported) {
        listen.current();
        return;
      }
      const options = { onEnd: () => listen.current(), onWord: beat };
      if (choices) {
        speaker.speak(
          id,
          choicesSpeech(reply.answer, choices, languageOf(reply.answer) === 'hi-IN'),
          { ...options, exact: true },
        );
      } else speaker.speak(id, reply.answer, options);
    },
    onError: (error, { voice }) => {
      const problem = toApiError(error);
      const id = newId();
      const content = problem.fieldError('messages') ?? problem.message;
      setMessages((current) => [...current, { id, role: 'assistant', content, error: true }]);
      if (!voice) return;
      if (readAloud && speaker.supported)
        speaker.speak(id, content, { exact: true, onEnd: () => listen.current(), onWord: beat });
      else listen.current();
    },
  });

  /** The question "which one?" still waiting for an answer, if the last message asked it. */
  const pending = (): ChatMessage | null => {
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' && last.choices && last.question ? last : null;
  };

  /** One of several people with the same name was picked: ask the same question about that person. */
  const choose = (question: string, person: AssistantPerson, shown: string, voice = false) => {
    if (ask.isPending) return;
    speaker.stop();
    setMessages([...messages, { id: newId(), role: 'user', content: shown }]);
    ask.mutate({
      history: [...messages, { id: newId(), role: 'user', content: question }],
      voice,
      question,
      pick: person,
    });
  };

  const send = (text: string, voice = false) => {
    const question = text.trim();
    if (!question || ask.isPending || blocked) return;
    // "Pehla", "class 5 wala": an answer to "which one?", not a new question.
    const open = pending();
    const picked = open ? choiceFromReply(question, open.choices!) : null;
    if (open && picked) {
      setDraft('');
      choose(open.question!, picked.pick, question, voice || Boolean(open.voice));
      return;
    }
    speaker.stop();
    const history: ChatMessage[] = [...messages, { id: newId(), role: 'user', content: question }];
    setMessages(history);
    setDraft('');
    ask.mutate({ history, voice, question });
  };

  const voice = useVoiceInput(lang, {
    onDone: (heard) => {
      silences.current = 0;
      if (STOP_WORDS.test(heard.trim())) endVoiceMode({ acknowledge: true });
      else send(heard, true);
    },
    // Nobody spoke: listen once more, then stop rather than keep the microphone open.
    onSilence: () => {
      if (!voiceModeRef.current) return;
      silences.current += 1;
      if (silences.current < 2) voice.start();
      else {
        endVoiceMode();
        setVoiceNote(
          'The voice conversation stopped — nothing was heard. Tap the microphone to start again.',
        );
      }
    },
    onFailed: () => endVoiceMode(),
  });
  useEffect(() => {
    listen.current = () => {
      if (voiceModeRef.current && voice.supported && !voice.listening) voice.start();
    };
  });

  // Words heard make the orb pulse, as words spoken do.
  useEffect(() => {
    if (voice.interim) beat();
  }, [voice.interim]);

  // A new language mid-conversation: listen again, in that language.
  useEffect(() => {
    if (voiceModeRef.current && voice.listening) voice.start();
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  function endVoiceMode({ acknowledge = false }: { acknowledge?: boolean } = {}) {
    voiceModeRef.current = false;
    setVoiceMode(false);
    voice.cancel();
    if (acknowledge && speaker.supported)
      speaker.speak(newId(), lang === 'hi-IN' ? 'ठीक है।' : 'Okay.', { exact: true });
    else speaker.stop();
  }

  /** The microphone button: one tap starts a voice conversation, the next ends it. */
  const toggleVoiceMode = () => {
    if (voiceModeRef.current) {
      endVoiceMode();
      return;
    }
    setVoiceNote(null);
    voiceModeRef.current = true;
    silences.current = 0;
    setVoiceMode(true);
    // This tap lets the browser speak the answers later; stop any reading so it does not hear itself.
    speaker.stop();
    speaker.unlock();
    voice.start();
  };

  /** Typing takes over from talking. */
  const type = (text: string) => {
    if (voiceModeRef.current) endVoiceMode();
    setDraft(text);
  };

  const clear = () => {
    if (voiceModeRef.current) endVoiceMode();
    speaker.stop();
    setMessages([]);
    setContext(null);
  };

  const phase: VoicePhase = voice.listening
    ? 'listening'
    : ask.isPending
      ? 'thinking'
      : speaker.speakingId
        ? 'speaking'
        : 'waiting';

  return {
    isPortal,
    status,
    unavailable,
    blocked,
    messages,
    draft,
    type,
    send,
    choose,
    pending,
    clear,
    isAsking: ask.isPending,
    lang,
    setLang,
    readAloud,
    setReadAloud,
    voice,
    speaker,
    voiceMode,
    voiceNote,
    toggleVoiceMode,
    endVoiceMode: () => endVoiceMode(),
    phase,
    pulse,
  };
}

export type AssistantChatState = ReturnType<typeof useAssistantChat>;
