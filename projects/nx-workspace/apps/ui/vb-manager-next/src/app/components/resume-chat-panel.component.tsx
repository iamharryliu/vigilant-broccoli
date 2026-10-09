'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import {
  Button,
  ChatSendButton,
  ScrollArea,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import {
  PROPOSAL_STATE,
  ProposalState,
  ResumeChatMessage,
  getProposalState,
} from '../hooks/useResumeChat';

interface ResumeChatPanelProps {
  messages: ResumeChatMessage[];
  isLoading: boolean;
  revision: number;
  canApply: boolean;
  onSend: (text: string) => void;
  onApply: (messageIndex: number) => void;
  onReset: () => void;
}

const ENTER_KEY = 'Enter';
const PLACEHOLDER =
  'Paste a job request, ask about your resume, or request an edit...';
const EMPTY_STATE =
  'Discuss your resume with the assistant. Paste a recruiter request and I will ask about anything your resume does not support, then draft a tailored one-page version. Drafts only change your resume when you press Apply.';
const THINKING_LABEL = 'Thinking';
const APPLY_LABEL = 'Apply changes';
const APPLIED_LABEL = 'Applied';
const NEW_CONVERSATION_LABEL = 'New conversation';
const FIX_JSON_HINT = 'Fix the JSON error before applying.';

const PROPOSAL_LABEL: Record<ProposalState, string> = {
  [PROPOSAL_STATE.APPLIED]: 'Applied',
  [PROPOSAL_STATE.READY]: 'Validated one-page draft',
  [PROPOSAL_STATE.STALE]:
    'Out of date: your resume changed. Ask me to refresh this draft.',
  [PROPOSAL_STATE.UNVALIDATED]: 'Not validated as one page. Cannot be applied.',
};

const PROMPT_SUGGESTIONS = [
  'Review my resume and suggest improvements.',
  'Make my work experience bullets more impactful.',
  'Tailor my resume for a job. I will paste the recruiter request.',
];

const MessageBody = ({ message }: { message: ResumeChatMessage }) => {
  if (message.isPending) {
    return (
      <div className="flex gap-2 items-center" style={{ padding: '0.25rem 0' }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <Text size="2" color="gray">
          {message.progress ?? THINKING_LABEL}
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
  revision,
  canApply,
  onApply,
}: {
  message: ResumeChatMessage;
  revision: number;
  canApply: boolean;
  onApply: () => void;
}) => {
  const isUser = message.role === 'user';
  const proposalState = message.proposal
    ? getProposalState(message.proposal, revision)
    : undefined;
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

      {proposalState && (
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
            {PROPOSAL_LABEL[proposalState]}
            {proposalState === PROPOSAL_STATE.READY && !canApply
              ? ` ${FIX_JSON_HINT}`
              : ''}
          </Text>
          <Button
            onClick={onApply}
            disabled={proposalState !== PROPOSAL_STATE.READY || !canApply}
            variant={
              proposalState === PROPOSAL_STATE.READY ? 'default' : 'secondary'
            }
          >
            {proposalState === PROPOSAL_STATE.APPLIED
              ? APPLIED_LABEL
              : APPLY_LABEL}
          </Button>
        </div>
      )}
    </div>
  );
};

export const ResumeChatPanel = ({
  messages,
  isLoading,
  revision,
  canApply,
  onSend,
  onApply,
  onReset,
}: ResumeChatPanelProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    onSend(content);
    setInput('');
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
                  revision={revision}
                  canApply={canApply}
                  onApply={() => onApply(index)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {messages.length > 0 && (
        <div className="flex justify-end" style={{ flexShrink: 0 }}>
          <Button variant="secondary" onClick={onReset}>
            {NEW_CONVERSATION_LABEL}
          </Button>
        </div>
      )}

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
