'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Spinner } from '@radix-ui/themes';
import {
  Button,
  ChatSendButton,
  ScrollArea,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODEL,
} from '@vigilant-broccoli/common-js';
import { ResumeData } from '@vigilant-broccoli/resume';
import { authFetch } from '../../../libs/auth';
import {
  RESUME_CHAT_API_PATH,
  RESUME_CHAT_RESPONSE_TYPE,
} from '../constants/resume-chat.consts';

interface ResumeUpdate {
  resume: ResumeData;
  summary: string;
  applied: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isPending?: boolean;
  update?: ResumeUpdate;
}

interface ResumeChatPanelProps {
  resume: ResumeData;
  onApplyResume: (resume: ResumeData) => void;
}

const ENTER_KEY = 'Enter';
const PLACEHOLDER = 'Ask about your resume or request an edit...';
const EMPTY_STATE =
  'Discuss your resume with the assistant. Ask for feedback, or request edits and apply them with one click.';
const ERROR_MESSAGE = 'Failed to get a response. Please try again.';
const THINKING_LABEL = 'Thinking';
const APPLY_LABEL = 'Apply changes';
const APPLIED_LABEL = 'Applied';

const PROMPT_SUGGESTIONS = [
  'Review my resume and suggest improvements.',
  'Make my work experience bullets more impactful.',
  'Add a skill: TypeScript.',
];

const sendResumeChat = async (
  history: ChatMessage[],
  resume: ResumeData,
): Promise<
  | { type: typeof RESUME_CHAT_RESPONSE_TYPE.TEXT; content: string }
  | {
      type: typeof RESUME_CHAT_RESPONSE_TYPE.RESUME_UPDATE;
      resume: ResumeData;
      summary: string;
    }
> => {
  const response = await authFetch(RESUME_CHAT_API_PATH, {
    method: HTTP_METHOD.POST,
    headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
    body: JSON.stringify({
      messages: history.map(({ role, content }) => ({ role, content })),
      resume,
      model: LLM_MODEL.GPT_4O,
    }),
  });

  if (!response.ok) throw new Error(ERROR_MESSAGE);
  return response.json();
};

const MessageBody = ({ message }: { message: ChatMessage }) => {
  if (message.isPending) {
    return (
      <div className="flex gap-2 items-center" style={{ padding: '0.25rem 0' }}>
        <Spinner size="1" />
        <Text size="2" color="gray">
          {THINKING_LABEL}
        </Text>
      </div>
    );
  }
  if (message.role === 'user') {
    return (
      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
      </Text>
    );
  }
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  );
};

const MessageBubble = ({
  message,
  onApply,
}: {
  message: ChatMessage;
  onApply: () => void;
}) => {
  const isUser = message.role === 'user';
  return (
    <div
      style={{
        maxWidth: '90%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        padding: isUser ? '0.5rem 0.875rem' : 0,
        borderRadius: isUser ? '1rem' : 0,
        backgroundColor: isUser ? 'var(--accent-3)' : 'transparent',
      }}
    >
      <MessageBody message={message} />

      {message.update && (
        <div
          className="flex items-center justify-between gap-3"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--gray-6)',
            borderRadius: '0.5rem',
          }}
        >
          <Text size="2" color="gray">
            {message.update.applied ? APPLIED_LABEL : 'Proposed edit'}
          </Text>
          <Button
            onClick={onApply}
            disabled={message.update.applied}
            variant={message.update.applied ? 'secondary' : 'default'}
          >
            {message.update.applied ? APPLIED_LABEL : APPLY_LABEL}
          </Button>
        </div>
      )}
    </div>
  );
};

export const ResumeChatPanel = ({
  resume,
  onApplyResume,
}: ResumeChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const history = [...messages, userMessage];
    setMessages([
      ...history,
      { role: 'assistant', content: '', isPending: true },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendResumeChat(history, resume);
      const assistantMessage: ChatMessage =
        result.type === RESUME_CHAT_RESPONSE_TYPE.RESUME_UPDATE
          ? {
              role: 'assistant',
              content: result.summary,
              update: {
                resume: result.resume,
                summary: result.summary,
                applied: false,
              },
            }
          : { role: 'assistant', content: result.content };
      setMessages([...history, assistantMessage]);
    } catch {
      setMessages([...history, { role: 'assistant', content: ERROR_MESSAGE }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (messageIndex: number) => {
    setMessages(prev => {
      const target = prev[messageIndex];
      if (!target.update) return prev;
      onApplyResume(target.update.resume);
      const updated = [...prev];
      updated[messageIndex] = {
        ...target,
        update: { ...target.update, applied: true },
      };
      return updated;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ENTER_KEY && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea viewportRef={scrollRef} className="h-full">
          {messages.length === 0 ? (
            <div
              className="flex flex-col gap-3 h-full"
              style={{ padding: '0.5rem' }}
            >
              <Text size="2" color="gray">
                {EMPTY_STATE}
              </Text>
              <div className="flex flex-col gap-2 items-start">
                {PROMPT_SUGGESTIONS.map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="secondary"
                    onClick={() => handleSend(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3" style={{ padding: '0.5rem' }}>
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  onApply={() => handleApply(index)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex gap-2 items-end" style={{ flexShrink: 0 }}>
        <Textarea
          placeholder={PLACEHOLDER}
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          className="flex-1 min-h-[2.25rem] max-h-48"
        />
        <ChatSendButton
          isStreaming={false}
          isDisabled={isLoading || !input.trim()}
          onSend={() => handleSend()}
          onStop={() => undefined}
        />
      </div>
    </div>
  );
};
