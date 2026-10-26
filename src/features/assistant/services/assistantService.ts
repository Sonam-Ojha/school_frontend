import { http } from '@/lib/axios';
import type { ApiResource } from '@/types/api';

import type { AssistantContext, AssistantPerson, AssistantReply, AssistantStatus } from '../types';

/** A question can take several lookups; give it longer than an ordinary request. */
const ASK_TIMEOUT_MS = 150_000;

export interface AskInput {
  /** The conversation so far, ending with the new question. */
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  voice: boolean;
  /** What the last answer was about, so a follow-up question needs no name. */
  context: AssistantContext | null;
  /** The person tapped among several with the same name. */
  pick?: AssistantPerson;
}

export const assistantService = {
  async status(signal?: AbortSignal): Promise<AssistantStatus> {
    const { data } = await http.get<ApiResource<AssistantStatus>>('/assistant/status', { signal });
    return data.data;
  },

  async ask(input: AskInput): Promise<AssistantReply> {
    const { data } = await http.post<ApiResource<AssistantReply>>('/assistant/ask', input, {
      timeout: ASK_TIMEOUT_MS,
    });
    return data.data;
  },
};
