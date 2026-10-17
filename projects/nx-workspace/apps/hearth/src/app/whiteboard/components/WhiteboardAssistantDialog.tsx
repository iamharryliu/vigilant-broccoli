'use client';

import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import {
  Button,
  ChatSendButton,
  Dialog,
  DialogContent,
  DialogTitle,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Text,
  Textarea,
  cn,
} from '@vigilant-broccoli/react-lib';
import {
  DIFF_LINE_KIND,
  DiffLineKind,
  diffLines,
} from '../whiteboard-diff.utils';

const ASSISTANT_ENDPOINT = '/api/whiteboard/assistant';
const DIALOG_TITLE = 'AI edit';
const PLACEHOLDER = 'Ask a question or describe an edit…';
const EMPTY_TEXT =
  'Ask about this document or request an edit: rewrite it, organize notes, fix spelling, or add content.';
const EMPTY_DOCUMENT_HINT =
  'The document is empty, so I can draft new content for you.';
const ERROR_TEXT = 'The assistant could not respond.';
const STALE_TEXT =
  'The document changed after this edit was proposed, so it can no longer be applied.';
const PROPOSAL_STATE = {
  PENDING: 'pending',
  APPLIED: 'applied',
  DISMISSED: 'dismissed',
} as const;
const DIFF_CLASS: Record<DiffLineKind, string> = {
  [DIFF_LINE_KIND.SAME]: 'text-muted-foreground',
  [DIFF_LINE_KIND.ADDED]: 'bg-green-500/20',
  [DIFF_LINE_KIND.REMOVED]: 'bg-red-500/20 line-through',
};
const DIFF_PREFIX: Record<DiffLineKind, string> = {
  [DIFF_LINE_KIND.SAME]: '  ',
  [DIFF_LINE_KIND.ADDED]: '+ ',
  [DIFF_LINE_KIND.REMOVED]: '- ',
};

type ProposalState = (typeof PROPOSAL_STATE)[keyof typeof PROPOSAL_STATE];

interface Proposal {
  base: string;
  proposed: string;
  state: ProposalState;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  proposal?: Proposal;
}

interface WhiteboardAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: number | null;
  boardKey: string;
  token: string;
  content: string;
  setContent: (content: string) => void;
  editor: ReactNode;
}

export function WhiteboardAssistantDialog({
  open,
  onOpenChange,
  homeId,
  boardKey,
  token,
  content,
  setContent,
  editor,
}: WhiteboardAssistantDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [failedHistory, setFailedHistory] = useState<ChatMessage[] | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    requestIdRef.current++;
    setMessages([]);
    setInput('');
    setSending(false);
    setFailedHistory(null);
  }, [homeId, boardKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending, failedHistory]);

  const run = async (history: ChatMessage[]) => {
    if (!homeId || !token) return;
    const requestId = ++requestIdRef.current;
    const base = contentRef.current;
    setMessages(history);
    setFailedHistory(null);
    setSending(true);

    const res = await fetch(ASSISTANT_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: {
        [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${token}`,
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      },
      body: JSON.stringify({
        homeId,
        boardKey,
        document: base,
        messages: history.map(({ role, content: text }) => ({
          role,
          content: text,
        })),
      }),
    }).catch(() => null);
    const data = res?.ok ? await res.json().catch(() => null) : null;

    if (requestId !== requestIdRef.current) return;
    setSending(false);
    if (!data || typeof data.reply !== 'string') {
      setFailedHistory(history);
      return;
    }
    const reply: ChatMessage = {
      role: 'assistant',
      content: data.reply,
      proposal:
        typeof data.updatedDocument === 'string'
          ? {
              base,
              proposed: data.updatedDocument,
              state: PROPOSAL_STATE.PENDING,
            }
          : undefined,
    };
    setMessages([...history, reply]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    run([...messages, { role: 'user', content: text }]);
  };

  const setProposalState = (index: number, state: ProposalState) =>
    setMessages(prev =>
      prev.map((m, i) =>
        i === index && m.proposal
          ? { ...m, proposal: { ...m.proposal, state } }
          : m,
      ),
    );

  const apply = (index: number) => {
    const proposal = messages[index]?.proposal;
    if (!proposal || proposal.base !== contentRef.current) return;
    setContent(proposal.proposed);
    setProposalState(index, PROPOSAL_STATE.APPLIED);
  };

  const regenerate = (index: number) => run(messages.slice(0, index));

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const renderProposal = (proposal: Proposal, index: number) => {
    if (proposal.state === PROPOSAL_STATE.APPLIED)
      return (
        <Text size="1" color="green">
          Edit applied. Use undo in the editor to revert it.
        </Text>
      );
    if (proposal.state === PROPOSAL_STATE.DISMISSED)
      return (
        <Text size="1" color="gray">
          Edit dismissed.
        </Text>
      );

    const isStale = proposal.base !== content;
    return (
      <div className="mt-2 flex flex-col gap-2">
        <pre className="max-h-60 overflow-auto rounded border border-border bg-background p-2 font-mono text-xs">
          {diffLines(proposal.base, proposal.proposed).map((line, i) => (
            <div
              key={i}
              className={cn('whitespace-pre-wrap', DIFF_CLASS[line.kind])}
            >
              {DIFF_PREFIX[line.kind]}
              {line.text}
            </div>
          ))}
        </pre>
        {isStale && (
          <Text size="1" color="red" role="alert">
            {STALE_TEXT}
          </Text>
        )}
        <div className="flex flex-wrap gap-2">
          {isStale ? (
            <Button
              size="sm"
              disabled={sending}
              onClick={() => regenerate(index)}
            >
              Regenerate with latest content
            </Button>
          ) : (
            <Button size="sm" onClick={() => apply(index)}>
              Apply
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setProposalState(index, PROPOSAL_STATE.DISMISSED)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        fullScreenOnMobile
        className={cn(
          'flex h-[85dvh] w-[calc(100%-2rem)] max-w-[1200px] flex-col gap-3',
          FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
        )}
      >
        <DialogTitle className="text-xl font-bold leading-7 tracking-normal">
          {DIALOG_TITLE}
        </DialogTitle>
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1">
          <div className="flex min-h-0 flex-col">{editor}</div>
          <div className="flex min-h-0 flex-col gap-3">
            <div
              ref={scrollRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
              aria-live="polite"
            >
              {messages.length === 0 && !sending && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6">
                  <Text align="center" color="gray" size="2">
                    {EMPTY_TEXT}
                  </Text>
                  {content.trim() === '' && (
                    <Text align="center" color="gray" size="2">
                      {EMPTY_DOCUMENT_HINT}
                    </Text>
                  )}
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-2 ${
                      m.role === 'user'
                        ? 'bg-[var(--accent-a4)]'
                        : 'bg-[var(--gray-a3)]'
                    }`}
                  >
                    <Text size="2" className="whitespace-pre-wrap">
                      {m.content}
                    </Text>
                    {m.proposal && renderProposal(m.proposal, i)}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-[var(--gray-a3)] px-3 py-2">
                    <Text size="2" color="gray">
                      Thinking…
                    </Text>
                  </div>
                </div>
              )}
              {failedHistory && (
                <div className="flex items-center gap-2" role="alert">
                  <Text size="2" color="red">
                    {ERROR_TEXT}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => run(failedHistory)}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                className="min-h-[44px] grow"
                rows={2}
                placeholder={PLACEHOLDER}
                aria-label="Message the document assistant"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={sending}
              />
              <ChatSendButton
                isStreaming={false}
                isDisabled={!input.trim() || sending}
                onSend={send}
                onStop={() => undefined}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
