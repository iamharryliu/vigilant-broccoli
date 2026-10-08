import OpenAI from 'openai';
import { z } from 'zod';
import {
  RESUME_PDF_MAX_PAGES,
  describeResumePdfLayout,
  validateResume,
} from '@vigilant-broccoli/resume';
import type { ResumeData, ResumePdfLayout } from '@vigilant-broccoli/resume';
import { renderResumePdf } from '@vigilant-broccoli/resume/server';
import {
  RESUME_CHAT_LIMITS,
  RESUME_CHAT_RESPONSE_TYPE,
  RESUME_CHAT_TOOL_NAME,
  RESUME_CHAT_VALIDATION_STATUS,
} from '../../../constants/resume-chat.consts';
import {
  EMPTY_TAILORING_CONTEXT,
  tailoringContextSchema,
} from '../../../../lib/resume-chat.schema';
import type {
  ResumeChatEvent,
  ResumeChatRequest,
  ResumeChatResult,
  ResumeChatValidation,
  TailoringContext,
  UnconfirmedKeyword,
} from '../../../../lib/resume-chat.schema';
import {
  findGroundingIssues,
  sanitizeTailoringContext,
} from '../../../../lib/resume-chat.grounding';
import { RESUME_CHAT_TOOLS, buildSystemPrompt } from './resume-chat.prompt';

type ChatMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type ResultEvent = ResumeChatResult;

const MAX_MODEL_CALLS = RESUME_CHAT_LIMITS.MAX_REVISIONS + 1;
const MAX_ISSUES_SHOWN = 10;
const REJECTED_STATUS = 'rejected';

const MESSAGE = {
  DEFAULT_SUMMARY: 'Here is the updated resume.',
  CONTEXT_RECORDED: 'Noted. Tell me what you would like to do next.',
  EMPTY_REPLY: 'The model returned an empty reply. Please try again.',
  MODEL_FAILED: 'The model request failed. Your resume was not changed.',
  NO_DRAFT:
    'The model could not produce a valid, supported resume draft, so nothing was proposed and your resume was not changed.',
  TOOL_RECORDED: 'Ledger recorded.',
  TOOL_REJECTED:
    'Draft rejected. Fix every problem and call update_resume again with the COMPLETE shorter or corrected resume. Keep confirmed facts, every employer, role and date, and the most relevant content.',
  IGNORED_FACTS:
    'I ignored these "confirmed" items because they do not quote anything you wrote or you said you lack them:',
  UNCONFIRMED_HEADING: '**Left out because unconfirmed:**',
  VALIDATED: (attempts: number) =>
    `**Validated:** rendered with the same PDF pipeline as Download and it is exactly ${RESUME_PDF_MAX_PAGES} page (attempt ${attempts} of ${MAX_MODEL_CALLS}). Nothing is applied until you press Apply.`,
  UNVALIDATED: (attempts: number, detail: string) =>
    `**Not validated:** after ${attempts} attempt(s) I could not confirm a one-page result (${detail}). I kept this draft so we can keep working on it, but it cannot be applied. Tell me what to prioritise or cut, for example which older roles or bullets matter least.`,
  RENDER_FAILED: (detail: string) => `the PDF check itself failed: ${detail}`,
  DRAFT_REJECTED: 'Draft was rejected',
  PROGRESS_THINKING: 'Thinking',
  PROGRESS_REPLY: 'Writing a reply',
  PROGRESS_CHECKING: 'Checking the draft against your confirmed facts',
  PROGRESS_RENDERING: (attempt: number) =>
    `Rendering the one-page PDF check (attempt ${attempt} of ${MAX_MODEL_CALLS})`,
  PROGRESS_REVISING: (revision: number, reason: string) =>
    `${reason}; asking for a revision (${revision} of ${RESUME_CHAT_LIMITS.MAX_REVISIONS})`,
} as const;

const updateArgsSchema = z.object({
  resume: z.unknown(),
  summary: z.string().optional(),
  unconfirmed: z
    .array(z.object({ keyword: z.string(), reason: z.string() }))
    .optional(),
  identityChangeEvidence: z.string().optional(),
});

interface Candidate {
  resume: ResumeData;
  summary: string;
  unconfirmed: UnconfirmedKeyword[];
  layout?: ResumePdfLayout;
}

type Evaluation =
  | { kind: 'validated'; candidate: Candidate; layout: ResumePdfLayout }
  | {
      kind: 'rejected';
      problems: string[];
      candidate?: Candidate;
      renderFailed?: boolean;
    };

interface RunOptions {
  openai: OpenAI;
  model: string;
  request: ResumeChatRequest;
  emit: (event: ResumeChatEvent) => void;
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const evaluateUpdate = async (
  rawArguments: string,
  request: ResumeChatRequest,
  context: TailoringContext,
  userMessages: string[],
  attempt: number,
  emit: RunOptions['emit'],
): Promise<Evaluation> => {
  const args = updateArgsSchema.safeParse(parseJson(rawArguments));
  if (!args.success) {
    return {
      kind: 'rejected',
      problems: ['The tool arguments were not a valid JSON object.'],
    };
  }

  const validation = validateResume(args.data.resume);
  if (!validation.ok) {
    return {
      kind: 'rejected',
      problems: validation.errors.slice(0, MAX_ISSUES_SHOWN),
    };
  }

  const candidate: Candidate = {
    resume: validation.resume,
    summary: args.data.summary?.trim() || MESSAGE.DEFAULT_SUMMARY,
    unconfirmed: args.data.unconfirmed ?? [],
  };

  emit({
    type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
    message: MESSAGE.PROGRESS_CHECKING,
  });
  const groundingIssues = findGroundingIssues({
    current: request.resume,
    candidate: candidate.resume,
    context,
    userMessages,
    identityChangeEvidence: args.data.identityChangeEvidence,
  });
  if (groundingIssues.length > 0) {
    return { kind: 'rejected', problems: groundingIssues };
  }

  emit({
    type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
    message: MESSAGE.PROGRESS_RENDERING(attempt),
  });
  try {
    const { layout } = await renderResumePdf(candidate.resume);
    if (layout.fits) {
      return { kind: 'validated', candidate: { ...candidate, layout }, layout };
    }
    return {
      kind: 'rejected',
      problems: [describeResumePdfLayout(layout)],
      candidate: { ...candidate, layout },
    };
  } catch (error) {
    return {
      kind: 'rejected',
      problems: [MESSAGE.RENDER_FAILED(errorMessage(error))],
      candidate,
      renderFailed: true,
    };
  }
};

const withNotes = (
  body: string,
  unconfirmed: UnconfirmedKeyword[],
  ignoredFacts: string[],
  extra: string[] = [],
): string =>
  [
    body,
    unconfirmed.length > 0
      ? [
          MESSAGE.UNCONFIRMED_HEADING,
          ...unconfirmed.map(
            ({ keyword, reason }) => `- ${keyword}: ${reason}`,
          ),
        ].join('\n')
      : '',
    ignoredFacts.length > 0
      ? [MESSAGE.IGNORED_FACTS, ...ignoredFacts.map(fact => `- ${fact}`)].join(
          '\n',
        )
      : '',
    ...extra,
  ]
    .filter(Boolean)
    .join('\n\n');

const buildUpdateEvent = (
  candidate: Candidate,
  validation: ResumeChatValidation,
  context: TailoringContext,
  ignoredFacts: string[],
  modelText: string,
): ResultEvent => {
  const attempts = validation.attempts;
  const status =
    validation.status === RESUME_CHAT_VALIDATION_STATUS.VALIDATED
      ? MESSAGE.VALIDATED(attempts)
      : MESSAGE.UNVALIDATED(attempts, validation.issues.join(' '));
  return {
    type: RESUME_CHAT_RESPONSE_TYPE.RESUME_UPDATE,
    content: withNotes(
      [candidate.summary, modelText].filter(Boolean).join('\n\n'),
      candidate.unconfirmed,
      ignoredFacts,
      [status],
    ),
    resume: candidate.resume,
    validation,
    unconfirmed: candidate.unconfirmed,
    context,
  };
};

type ToolCall = OpenAI.Chat.Completions.ChatCompletionMessageToolCall;

const isToolCall = (toolCall: ToolCall, name: string): boolean =>
  toolCall.function.name === name;

const recordContextCalls = (
  toolCalls: ToolCall[],
  current: TailoringContext,
  userMessages: string[],
): { context: TailoringContext; ignoredFacts: string[] } =>
  toolCalls
    .filter(toolCall =>
      isToolCall(toolCall, RESUME_CHAT_TOOL_NAME.RECORD_TAILORING_CONTEXT),
    )
    .reduce(
      (state, toolCall) => {
        const parsed = tailoringContextSchema.safeParse(
          parseJson(toolCall.function.arguments),
        );
        if (!parsed.success) return state;
        const sanitized = sanitizeTailoringContext(parsed.data, userMessages);
        return {
          context: sanitized.context,
          ignoredFacts: [...state.ignoredFacts, ...sanitized.ignoredFacts],
        };
      },
      { context: current, ignoredFacts: [] as string[] },
    );

const toolResults = (
  toolCalls: ToolCall[],
  feedback?: { id: string; content: string },
): ChatMessageParam[] =>
  toolCalls.map(toolCall => ({
    role: 'tool',
    tool_call_id: toolCall.id,
    content:
      feedback?.id === toolCall.id ? feedback.content : MESSAGE.TOOL_RECORDED,
  }));

const describeOverflow = (candidate?: Candidate): string =>
  candidate?.layout
    ? `Draft is ${candidate.layout.pageCount} pages, about ${candidate.layout.overflowLines} lines too long`
    : MESSAGE.DRAFT_REJECTED;

export async function runResumeChat({
  openai,
  model,
  request,
  emit,
}: RunOptions): Promise<ResultEvent> {
  const userMessages = request.messages
    .filter(message => message.role === 'user')
    .map(message => message.content);
  const initial = sanitizeTailoringContext(
    request.context ?? EMPTY_TAILORING_CONTEXT,
    userMessages,
  );
  let context = initial.context;
  const ignoredFacts = [...initial.ignoredFacts];

  const messages: ChatMessageParam[] = [
    {
      role: 'system',
      content: buildSystemPrompt(request.resume, context, request.proposal),
    },
    ...request.messages,
  ];

  let lastDraft: Candidate | undefined;
  let lastProblems: string[] = [];
  let hasRequestedReply = false;

  const unvalidated = (attempts: number, modelText: string): ResultEvent =>
    lastDraft
      ? buildUpdateEvent(
          lastDraft,
          {
            status: RESUME_CHAT_VALIDATION_STATUS.UNVALIDATED,
            attempts,
            issues: lastProblems,
            layout: lastDraft.layout,
          },
          context,
          ignoredFacts,
          modelText,
        )
      : {
          type: RESUME_CHAT_RESPONSE_TYPE.ERROR,
          message: `${MESSAGE.NO_DRAFT} ${lastProblems.join(' ')}`.trim(),
        };

  try {
    for (let call = 1; call <= MAX_MODEL_CALLS; call += 1) {
      emit({
        type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
        message:
          call === 1 ? MESSAGE.PROGRESS_THINKING : MESSAGE.PROGRESS_REPLY,
      });
      const completion = await openai.chat.completions.create({
        model,
        messages,
        tools: RESUME_CHAT_TOOLS,
        tool_choice: 'auto',
      });
      const message = completion.choices[0]?.message;
      if (!message) throw new Error(MESSAGE.EMPTY_REPLY);

      const toolCalls = message.tool_calls ?? [];
      const modelText = message.content?.trim() ?? '';

      const recorded = recordContextCalls(toolCalls, context, userMessages);
      context = recorded.context;
      ignoredFacts.push(...recorded.ignoredFacts);

      const updateCall = toolCalls.find(toolCall =>
        isToolCall(toolCall, RESUME_CHAT_TOOL_NAME.UPDATE_RESUME),
      );

      if (!updateCall) {
        if (lastDraft) return unvalidated(call - 1, modelText);
        if (modelText || toolCalls.length === 0) {
          return {
            type: RESUME_CHAT_RESPONSE_TYPE.TEXT,
            content: withNotes(
              modelText || MESSAGE.EMPTY_REPLY,
              [],
              ignoredFacts,
            ),
            context,
          };
        }
        if (hasRequestedReply) {
          return {
            type: RESUME_CHAT_RESPONSE_TYPE.TEXT,
            content: MESSAGE.CONTEXT_RECORDED,
            context,
          };
        }
        hasRequestedReply = true;
        messages.push(message, ...toolResults(toolCalls));
        continue;
      }

      const evaluation = await evaluateUpdate(
        updateCall.function.arguments,
        request,
        context,
        userMessages,
        call,
        emit,
      );

      if (evaluation.kind === 'validated') {
        return buildUpdateEvent(
          evaluation.candidate,
          {
            status: RESUME_CHAT_VALIDATION_STATUS.VALIDATED,
            attempts: call,
            issues: [],
            layout: evaluation.layout,
          },
          context,
          ignoredFacts,
          modelText,
        );
      }

      lastProblems = evaluation.problems;
      if (evaluation.candidate) lastDraft = evaluation.candidate;

      if (evaluation.renderFailed || call === MAX_MODEL_CALLS) {
        return unvalidated(call, modelText);
      }

      emit({
        type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
        message: MESSAGE.PROGRESS_REVISING(
          call,
          describeOverflow(evaluation.candidate),
        ),
      });
      messages.push(
        message,
        ...toolResults(toolCalls, {
          id: updateCall.id,
          content: JSON.stringify({
            status: REJECTED_STATUS,
            problems: evaluation.problems,
            layout: evaluation.candidate?.layout,
            instructions: MESSAGE.TOOL_REJECTED,
          }),
        }),
      );
    }
  } catch (error) {
    console.error(MESSAGE.MODEL_FAILED, error);
    return {
      type: RESUME_CHAT_RESPONSE_TYPE.ERROR,
      message: `${MESSAGE.MODEL_FAILED} ${errorMessage(error)}`,
    };
  }

  return unvalidated(MAX_MODEL_CALLS, '');
}
