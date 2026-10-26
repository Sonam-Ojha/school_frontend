import { RotateCcw } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toApiError } from '@/lib/apiError';

import { AssistantChat } from '../components/AssistantChat';
import { useAssistantChat } from '../hooks/useAssistantChat';

/**
 * `/assistant`: ask about any student, teacher, class, attendance, fees or
 * results, typed or spoken, in English, Hinglish or Hindi. The same
 * conversation is open from the chat button in the corner of every page.
 */
export default function AssistantPage() {
  const chat = useAssistantChat();

  if (chat.isPortal) {
    return (
      <>
        <PageHeader title="AI assistant" />
        <Alert tone="info">The AI assistant is for the school’s staff.</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="AI assistant"
        description={
          chat.status.data?.engine === 'claude'
            ? 'Ask about any student, teacher, class, attendance, fees or results — type, or tap the microphone once and just talk, in English or Hindi.'
            : 'Ask about any student, teacher, class, attendance, fees or results — type, or tap the microphone once and just talk, in English or Hindi. Answers come straight from your school’s records, inside this system.'
        }
        actions={
          chat.messages.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="size-4" />}
              onClick={chat.clear}
            >
              New chat
            </Button>
          ) : undefined
        }
      />

      {chat.unavailable && (
        <Alert tone="warning" className="mb-4">
          {chat.unavailable}
        </Alert>
      )}
      {chat.status.isError && (
        <Alert tone="warning" className="mb-4">
          {toApiError(chat.status.error).message}
        </Alert>
      )}

      <Card className="flex h-[calc(100dvh-14rem)] min-h-[28rem] flex-col overflow-hidden">
        <AssistantChat chat={chat} />
      </Card>
    </>
  );
}
