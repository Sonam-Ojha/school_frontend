/** The assistant, as the API describes it (`/assistant/…`). */

export interface AssistantStatus {
  /** False when the plan leaves it out or the account is a family's. */
  available: boolean;
  reason: string | null;
  /** `builtin` answers from the school's records with no outside AI; `claude` uses Anthropic's Claude. */
  engine: 'builtin' | 'claude';
  model: string | null;
}

/** One lookup the assistant made to answer, shown under the answer. */
export interface AssistantStep {
  tool: string;
  label: string;
  ok: boolean;
}

/** A person the assistant can be asked about. */
export interface AssistantPerson {
  kind: 'student' | 'teacher' | 'staff';
  id: number;
  name: string;
}

/** A button under an answer: one of several people with the same name. */
export interface AssistantChoice {
  label: string;
  pick: AssistantPerson;
}

/** What the conversation is about so far; sent back with the next question so "and his fees?" follows on. */
export interface AssistantContext {
  person?: AssistantPerson;
  classRef?: { classId: number; sectionId: number | null; label: string };
}

export interface AssistantReply {
  answer: string;
  steps: AssistantStep[];
  choices: AssistantChoice[];
  context: AssistantContext | null;
  stopped: 'refused' | 'too_many_steps' | 'too_long' | null;
  engine: 'builtin' | 'claude';
}

/** The languages voice input listens for. Answers come in the language of the question. */
export type VoiceLang = 'en-IN' | 'hi-IN';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: AssistantStep[];
  /** People to choose between; tapping one asks `question` again about that person. */
  choices?: AssistantChoice[];
  question?: string;
  /** The question with choices was asked aloud, so the answer to it is read aloud too. */
  voice?: boolean;
  /** A failure shown in the conversation; never sent back to the assistant. */
  error?: boolean;
}
