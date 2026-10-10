'use client';

import { useCallback, useRef, useState } from 'react';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODEL,
} from '@vigilant-broccoli/common-js';
import { validateResume } from '@vigilant-broccoli/resume';
import type { ResumeData } from '@vigilant-broccoli/resume';
import { authFetch } from '../../../libs/auth';
import {
  RESUME_CHAT_API_PATH,
  RESUME_CHAT_RESPONSE_TYPE,
  RESUME_CHAT_VALIDATION_STATUS,
} from '../constants/resume-chat.consts';
import {
  EMPTY_TAILORING_CONTEXT,
  ProposalContext,
  ResumeChatEvent,
  ResumeChatResult,
  ResumeChatValidation,
  TailoringContext,
} from '../../lib/resume-chat.schema';

export interface ResumeProposal {
  resume: ResumeData;
  summary: string;
  validation: ResumeChatValidation;
  baseRevision: number;
  appliedRevision?: number;
}

export interface ResumeChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isPending?: boolean;
  progress?: string;
  proposal?: ResumeProposal;
}

export const PROPOSAL_STATE = {
  APPLIED: 'applied',
  READY: 'ready',
  STALE: 'stale',
  UNVALIDATED: 'unvalidated',
} as const;

export type ProposalState =
  (typeof PROPOSAL_STATE)[keyof typeof PROPOSAL_STATE];

interface UseResumeChatOptions {
  resume: ResumeData;
  revision: number;
  canApply: boolean;
  onApplyResume: (resume: ResumeData) => number;
}

const NDJSON_SEPARATOR = '\n';

const CHAT_ERROR = {
  FAILED: 'Failed to get a response. Please try again.',
  INTERRUPTED:
    'The connection ended before a reply arrived. Your resume was not changed.',
  INVALID_RESUME:
    'The assistant returned a resume that failed validation, so it was discarded. Your resume was not changed.',
  CHANGED_WHILE_WORKING:
    'Your resume changed while I was working, so this draft is based on an older version and cannot be applied. Ask me to refresh it onto your current resume.',
} as const;

const toProposalContext = (
  proposal: ResumeProposal,
  revision: number,
): ProposalContext => ({
  resume: proposal.resume,
  summary: proposal.summary,
  validated:
    proposal.validation.status === RESUME_CHAT_VALIDATION_STATUS.VALIDATED,
  applied: proposal.appliedRevision !== undefined,
  basedOnCurrentResume:
    (proposal.appliedRevision ?? proposal.baseRevision) === revision,
});

export const getProposalState = (
  proposal: ResumeProposal,
  revision: number,
): ProposalState => {
  if (proposal.appliedRevision !== undefined) return PROPOSAL_STATE.APPLIED;
  if (proposal.validation.status !== RESUME_CHAT_VALIDATION_STATUS.VALIDATED) {
    return PROPOSAL_STATE.UNVALIDATED;
  }
  return proposal.baseRevision === revision
    ? PROPOSAL_STATE.READY
    : PROPOSAL_STATE.STALE;
};

const readFinalEvent = async (
  response: Response,
  onProgress: (message: string) => void,
): Promise<ResumeChatResult | undefined> => {
  const reader = response.body?.getReader();
  if (!reader) return undefined;
  const decoder = new TextDecoder();
  let buffer = '';
  let finalEvent: ResumeChatResult | undefined;
  const handleLines = (lines: string[]) =>
    lines
      .filter(line => line.trim())
      .forEach(line => {
        const event = JSON.parse(line) as ResumeChatEvent;
        if (event.type === RESUME_CHAT_RESPONSE_TYPE.PROGRESS) {
          onProgress(event.message);
        } else {
          finalEvent = event;
        }
      });

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(NDJSON_SEPARATOR);
    buffer = lines.pop() ?? '';
    handleLines(lines);
  }
  handleLines([buffer]);
  return finalEvent;
};

export const useResumeChat = ({
  resume,
  revision,
  canApply,
  onApplyResume,
}: UseResumeChatOptions) => {
  const [messages, setMessages] = useState<ResumeChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(messages);
  const contextRef = useRef<TailoringContext>(EMPTY_TAILORING_CONTEXT);
  const epochRef = useRef(0);
  const latestRef = useRef({ resume, revision });
  latestRef.current = { resume, revision };

  const commitMessages = (next: ResumeChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  };

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isLoading) return;

      const epoch = epochRef.current;
      const requestRevision = latestRef.current.revision;
      const requestResume = latestRef.current.resume;
      const history = [
        ...messagesRef.current,
        { role: 'user', content } as ResumeChatMessage,
      ];
      const latestProposal = [...history]
        .reverse()
        .find(message => message.proposal)?.proposal;
      commitMessages([
        ...history,
        { role: 'assistant', content: '', isPending: true },
      ]);
      setIsLoading(true);

      const finish = (reply: ResumeChatMessage, context?: TailoringContext) => {
        if (epochRef.current !== epoch) return;
        if (context) contextRef.current = context;
        commitMessages([...history, reply]);
      };
      const showProgress = (progress: string) => {
        if (epochRef.current !== epoch) return;
        commitMessages([
          ...history,
          { role: 'assistant', content: '', isPending: true, progress },
        ]);
      };

      try {
        const response = await authFetch(RESUME_CHAT_API_PATH, {
          method: HTTP_METHOD.POST,
          headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
          body: JSON.stringify({
            messages: history.map(({ role, content: body }) => ({
              role,
              content: body,
            })),
            resume: requestResume,
            proposal: latestProposal
              ? toProposalContext(latestProposal, requestRevision)
              : undefined,
            context: contextRef.current,
            model: LLM_MODEL.GPT_4O,
          }),
        });
        if (!response.ok) throw new Error(CHAT_ERROR.FAILED);

        const result = await readFinalEvent(response, showProgress);

        if (!result) {
          finish({ role: 'assistant', content: CHAT_ERROR.INTERRUPTED });
        } else if (result.type === RESUME_CHAT_RESPONSE_TYPE.ERROR) {
          finish({ role: 'assistant', content: result.message });
        } else if (result.type === RESUME_CHAT_RESPONSE_TYPE.TEXT) {
          finish(
            { role: 'assistant', content: result.content },
            result.context,
          );
        } else {
          const validation = validateResume(result.resume);
          if (!validation.ok) {
            finish({ role: 'assistant', content: CHAT_ERROR.INVALID_RESUME });
          } else {
            const changedMeanwhile =
              latestRef.current.revision !== requestRevision;
            finish(
              {
                role: 'assistant',
                content: changedMeanwhile
                  ? `${result.content}\n\n${CHAT_ERROR.CHANGED_WHILE_WORKING}`
                  : result.content,
                proposal: {
                  resume: validation.resume,
                  summary: result.content,
                  validation: result.validation,
                  baseRevision: requestRevision,
                },
              },
              result.context,
            );
          }
        }
      } catch {
        finish({ role: 'assistant', content: CHAT_ERROR.FAILED });
      } finally {
        if (epochRef.current === epoch) setIsLoading(false);
      }
    },
    [isLoading],
  );

  const apply = useCallback(
    (messageIndex: number) => {
      const target = messagesRef.current[messageIndex]?.proposal;
      if (!target || !canApply) return;
      if (
        getProposalState(target, latestRef.current.revision) !==
        PROPOSAL_STATE.READY
      ) {
        return;
      }
      const appliedRevision = onApplyResume(target.resume);
      commitMessages(
        messagesRef.current.map((message, index) =>
          index === messageIndex && message.proposal
            ? { ...message, proposal: { ...message.proposal, appliedRevision } }
            : message,
        ),
      );
    },
    [canApply, onApplyResume],
  );

  const reset = useCallback(() => {
    epochRef.current += 1;
    contextRef.current = EMPTY_TAILORING_CONTEXT;
    commitMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, send, apply, reset };
};
