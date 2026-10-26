import { useCallback, useEffect, useRef, useState } from 'react';

import type { VoiceLang } from '../types';

/**
 * Speaking to the assistant and hearing it answer, with the browser's own
 * speech services: nothing is installed and no audio reaches our server.
 * Recognition works in Chrome and Edge (Google's and Microsoft's services do
 * the listening); reading aloud works in every current browser.
 */

// --- listening -------------------------------------------------------------------------

/** The parts of the Web Speech API's recognition used here; TypeScript's DOM types leave it out. */
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
type RecognitionConstructor = new () => Recognition;

const Recognizer: RecognitionConstructor | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: RecognitionConstructor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: RecognitionConstructor })
        .webkitSpeechRecognition);

const LISTEN_ERRORS: Record<string, string> = {
  'not-allowed':
    'The microphone is blocked. Allow it for this site in the browser’s address bar, then try again.',
  'service-not-allowed':
    'The microphone is blocked. Allow it for this site in the browser’s address bar, then try again.',
  'no-speech': 'Nothing was heard. Tap the microphone and speak again.',
  'audio-capture': 'No microphone was found on this device.',
  network: 'Voice input needs an internet connection.',
  'language-not-supported': 'This browser cannot listen in that language. Try English, or Chrome.',
};

interface VoiceInputHandlers {
  /** The whole question, once the speaker pauses. */
  onDone: (text: string) => void;
  /** Listening ended and nothing was said. */
  onSilence?: () => void;
  /** The microphone cannot be used (blocked, missing): there is no point trying again. */
  onFailed?: () => void;
}

/** Errors after which listening again would only fail again. */
const FATAL = new Set([
  'not-allowed',
  'service-not-allowed',
  'audio-capture',
  'language-not-supported',
]);

/**
 * Listens for one question. The words appear as they are heard (`interim`);
 * when the speaker pauses, `onDone` gets the whole question. `cancel` stops
 * without sending what was heard.
 */
export function useVoiceInput(lang: VoiceLang, handlers: VoiceInputHandlers) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const heard = useRef('');
  /** Set when we ended it ourselves: then nothing is reported. */
  const cancelled = useRef(false);
  const failed = useRef(false);
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  const start = useCallback(() => {
    if (!Recognizer) return;
    if (recognition.current) {
      cancelled.current = true;
      recognition.current.abort();
    }
    const listener = new Recognizer();
    listener.lang = lang;
    listener.interimResults = true;
    listener.continuous = false;
    listener.maxAlternatives = 1;
    heard.current = '';
    cancelled.current = false;
    failed.current = false;
    setError(null);
    setInterim('');

    listener.onresult = (event) => {
      let pending = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]!;
        if (result.isFinal) heard.current += result[0].transcript;
        else pending += result[0].transcript;
      }
      setInterim(`${heard.current}${pending}`);
    };
    listener.onerror = (event) => {
      if (event.error === 'aborted') return;
      // Silence is reported through `onSilence`, not as an error.
      if (event.error !== 'no-speech')
        setError(LISTEN_ERRORS[event.error] ?? 'Voice input stopped. Please try again.');
      if (FATAL.has(event.error)) failed.current = true;
    };
    listener.onend = () => {
      if (recognition.current !== listener) return;
      setListening(false);
      setInterim('');
      recognition.current = null;
      if (cancelled.current) return;
      const text = heard.current.trim();
      if (failed.current) latest.current.onFailed?.();
      else if (text) latest.current.onDone(text);
      else latest.current.onSilence?.();
    };

    recognition.current = listener;
    try {
      listener.start();
      setListening(true);
    } catch {
      recognition.current = null;
      setError('Voice input could not start. Please try again.');
      latest.current.onFailed?.();
    }
  }, [lang]);

  /** Stops listening and sends what was heard so far. */
  const stop = useCallback(() => recognition.current?.stop(), []);

  /** Stops listening and forgets what was heard. */
  const cancel = useCallback(() => {
    if (!recognition.current) return;
    cancelled.current = true;
    recognition.current.abort();
    recognition.current = null;
    setListening(false);
    setInterim('');
  }, []);

  useEffect(
    () => () => {
      cancelled.current = true;
      recognition.current?.abort();
    },
    [],
  );

  return { supported: Boolean(Recognizer), listening, interim, error, start, stop, cancel };
}

// --- speaking --------------------------------------------------------------------------

const speech =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

const DEVANAGARI = /[ऀ-ॿ]/;

/** The language to read a text in: Hindi when it is written in Devanagari. */
export const languageOf = (text: string): VoiceLang => (DEVANAGARI.test(text) ? 'hi-IN' : 'en-IN');

const ITEM = /^[-*•]\s+|^\d+[.)]\s+/;
const SUB_ITEM = /^\s{2,}([-*•]|\d+[.)])\s+/;

/** "…and 16 more are on the screen", in the answer's language. */
const more = (count: number, lang: VoiceLang): string =>
  lang === 'hi-IN' ? `और ${count} स्क्रीन पर देखें` : `and ${count} more are on the screen`;

/** One line as it should sound: no markdown, phone numbers, codes or symbols that read badly. */
function sayable(line: string, lang: VoiceLang): string {
  return (
    line
      .replace(SUB_ITEM, '')
      .replace(ITEM, '')
      .replace(/^\s*#{1,6}\s+/, '')
      .replace(/\s·\s.*$/, '')
      // Codes are for reading, not hearing: "admission no. ADM-2025-0029", "roll no. 15".
      .replace(/,?\s*(admission no\.|roll no\.|एडमिशन नंबर|रोल नंबर)\s*[A-Za-z0-9-]+/g, '')
      .replace(/\+?\b91[\s-]?\d[\d\s-]{8,}\d/g, '')
      .replace(/\b[A-Z]{2,4}-\d{2,}(-\d+)*\b/g, '')
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '')
      .replace(/\(\s*[,\s]*\)/g, '')
      .replace(/#(\d+)/g, lang === 'hi-IN' ? 'नंबर $1' : 'number $1')
      .replace(/(\d{1,2}:\d{2})–(\d{1,2}:\d{2})/g, lang === 'hi-IN' ? '$1 से $2' : '$1 to $2')
      .replace(/₹\s?/g, lang === 'hi-IN' ? 'रुपये ' : 'rupees ')
      .replace(/\s[—–]\s/g, ', ')
      .replace(/\|/g, ', ')
      .replace(/[*_`]/g, '')
      .replace(/,\s*,/g, ',')
      .replace(/[,\s]+$/g, '')
      .trim()
  );
}

/**
 * An answer as it should be spoken: the headline and the main points, with
 * long lists cut short ("…and 10 more are on the screen") — a list of fifteen
 * names and phone numbers is for reading, not for listening to.
 */
export function spokenText(text: string, lang: VoiceLang): string {
  const lines = text.split('\n').filter((line) => line.trim() && !/^\s*\|?\s*:?-{3,}/.test(line));
  const out: string[] = [];
  let items = 0;
  let skippedItems = 0;
  let subItems = 0;
  let skippedSubItems = 0;

  const flushSubs = () => {
    if (skippedSubItems > 0) out.push(more(skippedSubItems, lang));
    subItems = 0;
    skippedSubItems = 0;
  };

  for (const line of lines) {
    if (/^…|^\.\.\./.test(line.trim())) continue;
    if (SUB_ITEM.test(line)) {
      subItems += 1;
      if (subItems <= 3) out.push(sayable(line, lang));
      else skippedSubItems += 1;
      continue;
    }
    flushSubs();
    if (ITEM.test(line)) {
      items += 1;
      if (items <= 5) out.push(sayable(line, lang));
      else skippedItems += 1;
      continue;
    }
    if (skippedItems > 0) {
      out.push(more(skippedItems, lang));
      skippedItems = 0;
    }
    items = 0;
    out.push(sayable(line, lang));
  }
  flushSubs();
  if (skippedItems > 0) out.push(more(skippedItems, lang));

  return out
    .filter(Boolean)
    .map((sentence) => sentence.replace(/[.।:]+$/, ''))
    .join(lang === 'hi-IN' ? '। ' : '. ');
}

/** Speech split into sentences: Chrome stops reading one long utterance after about fifteen seconds. */
const sentences = (text: string): string[] =>
  text
    .split(/(?<=[.।?!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

function voiceFor(lang: VoiceLang): SpeechSynthesisVoice | undefined {
  const voices = speech?.getVoices() ?? [];
  const exact = voices.find((voice) => voice.lang.replace('_', '-') === lang);
  return exact ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2)));
}

/** Waits (briefly) for the browser's voices: Chrome lists none until they have loaded. */
function voicesReady(timeoutMs: number): Promise<void> {
  if (!speech || speech.getVoices().length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      speech.removeEventListener('voiceschanged', done);
      resolve();
    };
    const timer = window.setTimeout(done, timeoutMs);
    speech.addEventListener('voiceschanged', done);
  });
}

export interface SpeakOptions {
  /** Read exactly as given, not shortened for listening. */
  exact?: boolean;
  /** Runs when it has been read to the end (or the browser gave up) — not when it was stopped. */
  onEnd?: () => void;
  /** Runs at each word, where the browser reports words: for animating a speaking orb. */
  onWord?: () => void;
}

/**
 * Reads answers aloud, one at a time; `speakingId` is the one being read.
 *
 * Browsers' speech is fragile, and each failure here would leave a voice
 * conversation stuck: Chrome lists no voices until they load, can drop a
 * reading started straight after the last was stopped, can be left paused,
 * and forgets readings it is holding (so never says they finished). So the
 * voices are awaited, each reading starts a moment after the last stops, the
 * sentences are held on to, and a watchdog ends a reading the browser never
 * reports finishing.
 */
export function useSpeaker() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  /** The browser refused to speak without a click on the page first. */
  const [blocked, setBlocked] = useState(false);
  /** The reading in progress, read by the speech callbacks (state would be a render behind). */
  const current = useRef<string | null>(null);
  const held = useRef<SpeechSynthesisUtterance[]>([]);
  const watchdog = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Voices load in the background in some browsers; asking once starts that.
    speech?.getVoices();
    return () => {
      window.clearTimeout(watchdog.current);
      speech?.cancel();
    };
  }, []);

  const speak = useCallback((id: string, text: string, options: SpeakOptions = {}) => {
    if (!speech) {
      options.onEnd?.();
      return;
    }
    speech.cancel();
    window.clearTimeout(watchdog.current);
    const lang = languageOf(text);
    const parts = sentences(options.exact ? text : spokenText(text, lang));
    if (parts.length === 0) {
      options.onEnd?.();
      return;
    }
    current.current = id;
    setSpeakingId(id);

    const finish = (reachedEnd: boolean) => {
      if (current.current !== id) return;
      current.current = null;
      held.current = [];
      window.clearTimeout(watchdog.current);
      setSpeakingId(null);
      if (reachedEnd) options.onEnd?.();
    };

    const begin = () => {
      if (current.current !== id) return;
      speech.resume();
      const voice = voiceFor(lang);
      held.current = parts.map((part, index) => {
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.lang = lang;
        if (voice) utterance.voice = voice;
        utterance.onboundary = (event) => {
          if (current.current === id && (!event.name || event.name === 'word')) options.onWord?.();
        };
        utterance.onstart = () => setBlocked(false);
        utterance.onerror = (event) => {
          // Stopping cancels the queue, which reports each sentence as an error: those are ours.
          if (event.error === 'interrupted' || event.error === 'canceled') return;
          if (event.error === 'not-allowed') setBlocked(true);
          // Anything else: carry on as though it had been read, so a conversation is not left waiting.
          finish(true);
        };
        if (index === parts.length - 1) utterance.onend = () => finish(true);
        return utterance;
      });
      for (const utterance of held.current) speech.speak(utterance);
      // About seven characters a second, and some slack: past that, it is not coming.
      const estimate = parts.join(' ').length * 140 + 4_000;
      watchdog.current = window.setTimeout(() => finish(true), estimate);
    };

    void voicesReady(1_500).then(() => window.setTimeout(begin, 80));
  }, []);

  const stop = useCallback(() => {
    current.current = null;
    held.current = [];
    window.clearTimeout(watchdog.current);
    speech?.cancel();
    setSpeakingId(null);
  }, []);

  /**
   * Call from a click: some browsers only let a page speak once the person
   * has interacted with it, and a silent word spoken during the click
   * unlocks speech for the answers that come later.
   */
  const unlock = useCallback(() => {
    if (!speech || current.current) return;
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0;
    speech.speak(silent);
  }, []);

  return { supported: speech !== null, speakingId, blocked, speak, stop, unlock };
}
