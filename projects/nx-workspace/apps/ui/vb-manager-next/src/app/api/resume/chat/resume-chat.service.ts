import OpenAI from 'openai';
import { z } from 'zod';
import {
  RESUME_PDF_MAX_PAGES,
  describeResumePdfLayout,
  isResumePdfPolished,
  resumePdfFillShortfallPx,
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
import { findProtectedFieldIssues } from '../../../../lib/resume-chat.protection';
import {
  alignTitleWithTarget,
  findExtraSkills,
  findHighlightKeywords,
  highlightResumeKeywords,
  isKeywordInResume,
  orderSkillsByImportance,
  withRoleSummaryOpener,
} from '../../../../lib/resume-chat.highlight';
import type { SkillsNote } from '../../../../lib/resume-chat.skills-note';
import { RESUME_CHAT_TOOLS, buildSystemPrompt } from './resume-chat.prompt';
import { loadSkillsNote } from './resume-chat.skills-note.server';

type ChatMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type ResultEvent = ResumeChatResult;

const MAX_MODEL_CALLS = RESUME_CHAT_LIMITS.MAX_REVISIONS + 1;
const MAX_ISSUES_SHOWN = 10;
const REJECTED_STATUS = 'rejected';
const UNDERFILLED_STATUS = 'fits_but_underfilled';
const SHORT_LINES_STATUS = 'fits_but_has_short_lines';
const PERCENT = 100;

const MESSAGE = {
  DEFAULT_SUMMARY: 'Here is the updated resume.',
  CONTEXT_RECORDED: 'Noted. Tell me what you would like to do next.',
  EMPTY_REPLY: 'The model returned an empty reply. Please try again.',
  MODEL_FAILED: 'The model request failed. Your resume was not changed.',
  NO_DRAFT:
    'The model could not produce a valid, supported resume draft, so nothing was proposed and your resume was not changed.',
  TOOL_RECORDED: 'Ledger recorded.',
  TOOL_RECORDED_ONLY:
    'Ledger recorded. If the user supplied a job or recruiter request or asked for an edit, call update_resume now with a draft from supported facts and the gaps in unconfirmed; otherwise reply in plain text.',
  TOOL_REJECTED:
    'Draft rejected. Fix every problem and call update_resume again with the COMPLETE corrected resume. If it overflowed, shorten only as much as needed and do not drop below the target fill band; a previously retained one-page version is not lost. Keep confirmed facts, every employer, role and date, and the most relevant content.',
  TOOL_UNDERFILLED: `This draft fits ${RESUME_PDF_MAX_PAGES} page and is retained as the best fit so far, but it leaves noticeable unused space. Call update_resume again with the COMPLETE resume only if the current resume or user-confirmed facts hold more supported, job-relevant material to restore or develop: omitted achievements, clearer wording of existing facts, confirmed experience. Never invent claims, metrics or experience, repeat bullets, pad or keyword-stuff. If no more supported material exists, or the user asked for a concise version, reply in plain text instead, say so, and optionally ask which relevant experience they could add.`,
  TOOL_SHORT_LINES: `This draft fits ${RESUME_PDF_MAX_PAGES} page and is retained as the best fit so far, but some wrapped lines end with only a few words. Call update_resume again with the COMPLETE resume, tightening each listed bullet to one line or extending it with supported detail so its last line is mostly full. Change nothing else, keep the page fill, and never invent claims, metrics or experience. If a line cannot be fixed with supported wording, reply in plain text instead.`,
  UNCONFIRMED_HEADING: '**Left out because unconfirmed:**',
  VALIDATED: (attempts: number) =>
    `**Validated:** rendered with the same PDF pipeline as Download and it is exactly ${RESUME_PDF_MAX_PAGES} page (attempt ${attempts} of ${MAX_MODEL_CALLS}). Nothing is applied until you press Apply.`,
  VALIDATED_SPARSE: (attempts: number, percent: number, lines: number) =>
    `**Validated:** rendered with the same PDF pipeline as Download and it is exactly ${RESUME_PDF_MAX_PAGES} page (attempt ${attempts} of ${MAX_MODEL_CALLS}). About ${percent}% of the page is used, leaving room for roughly ${lines} more lines. I could not safely add more from the supported material; if there is other relevant experience you would like included, tell me and I will work it in. Nothing is applied until you press Apply.`,
  KEPT_EARLIER:
    'A later revision did not fit one page or did not improve on it, so this earlier validated version was kept.',
  UNVALIDATED: (attempts: number, detail: string) =>
    `**Not validated:** after ${attempts} attempt(s) I could not confirm a one-page result (${detail}). I kept this draft so we can keep working on it, but it cannot be applied. Tell me what to prioritise or cut, for example which older roles or bullets matter least.`,
  RENDER_FAILED: (detail: string) => `the PDF check itself failed: ${detail}`,
  DRAFT_REJECTED: 'Draft was rejected',
  PROGRESS_THINKING: 'Thinking',
  PROGRESS_REPLY: 'Writing a reply',
  PROGRESS_CHECKING: 'Checking the draft',
  PROGRESS_RENDERING: (attempt: number) =>
    `Rendering the one-page PDF check (attempt ${attempt} of ${MAX_MODEL_CALLS})`,
  PROGRESS_REVISING: (revision: number, reason: string) =>
    `${reason}; asking for a revision (${revision} of ${RESUME_CHAT_LIMITS.MAX_REVISIONS})`,
  PROGRESS_FILLING: (revision: number) =>
    `Refining to fill the page (${revision} of ${RESUME_CHAT_LIMITS.MAX_REVISIONS})`,
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
  attempt?: number;
}

type Evaluation = { unconfirmed: UnconfirmedKeyword[] } & (
  | { kind: 'fits'; candidate: Candidate; layout: ResumePdfLayout }
  | {
      kind: 'rejected';
      problems: string[];
      candidate?: Candidate;
      renderFailed?: boolean;
    }
);

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

/**
 * Appends as many of the extra skills as still fit the skills line without
 * adding a line or a page. Rendering is monotonic in the count, so a binary
 * search needs only a handful of renders.
 */
const fillSkillsLine = async (
  resume: ResumeData,
  layout: ResumePdfLayout,
  extras: string[],
  context: TailoringContext,
): Promise<{ resume: ResumeData; layout: ResumePdfLayout } | undefined> => {
  const withExtras = (count: number): ResumeData =>
    orderSkillsByImportance(
      {
        ...resume,
        skills: {
          ...resume.skills,
          technical: [...resume.skills.technical, ...extras.slice(0, count)],
        },
      },
      context,
    );
  let low = 0;
  let high = extras.length;
  let best: { resume: ResumeData; layout: ResumePdfLayout } | undefined;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const trial = withExtras(mid);
    const { layout: trialLayout } = await renderResumePdf(trial);
    if (
      trialLayout.fits &&
      trialLayout.skillsLineCount <= Math.max(layout.skillsLineCount, 1)
    ) {
      best = { resume: trial, layout: trialLayout };
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return best;
};

const evaluateUpdate = async (
  rawArguments: string,
  request: ResumeChatRequest,
  context: TailoringContext,
  userMessages: string[],
  skillsNote: SkillsNote | undefined,
  attempt: number,
  emit: RunOptions['emit'],
): Promise<Evaluation> => {
  const args = updateArgsSchema.safeParse(parseJson(rawArguments));
  if (!args.success) {
    return {
      kind: 'rejected',
      problems: ['The tool arguments were not a valid JSON object.'],
      unconfirmed: [],
    };
  }
  const unconfirmed = args.data.unconfirmed ?? [];

  const validation = validateResume(args.data.resume);
  if (!validation.ok) {
    return {
      kind: 'rejected',
      problems: validation.errors.slice(0, MAX_ISSUES_SHOWN),
      unconfirmed,
    };
  }

  const candidate: Candidate = {
    resume: withRoleSummaryOpener(
      alignTitleWithTarget(
        validation.resume,
        request.resume.basics.title,
        context,
        skillsNote,
      ),
    ),
    summary: args.data.summary?.trim() || MESSAGE.DEFAULT_SUMMARY,
    unconfirmed,
  };

  emit({
    type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
    message: MESSAGE.PROGRESS_CHECKING,
  });

  const protectedFieldIssues = findProtectedFieldIssues({
    current: request.resume,
    candidate: candidate.resume,
    userMessages,
    identityChangeEvidence: args.data.identityChangeEvidence,
    skillsNote,
  });
  if (protectedFieldIssues.length > 0) {
    return { kind: 'rejected', problems: protectedFieldIssues, unconfirmed };
  }

  const ordered = orderSkillsByImportance(candidate.resume, context);
  const highlightKeywords = findHighlightKeywords(ordered, context, skillsNote);
  candidate.resume = highlightResumeKeywords(ordered, highlightKeywords);

  emit({
    type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
    message: MESSAGE.PROGRESS_RENDERING(attempt),
  });
  try {
    const base = await renderResumePdf(candidate.resume);
    const filled = base.layout.fits
      ? await fillSkillsLine(
          candidate.resume,
          base.layout,
          findExtraSkills(
            request.resume,
            candidate.resume,
            context,
            userMessages.at(-1) ?? '',
            skillsNote,
          ),
          context,
        )
      : undefined;
    if (filled) candidate.resume = filled.resume;
    const layout = filled?.layout ?? base.layout;
    if (layout.fits) {
      return {
        kind: 'fits',
        candidate: { ...candidate, layout, attempt },
        layout,
        unconfirmed,
      };
    }
    return {
      kind: 'rejected',
      problems: [describeResumePdfLayout(layout)],
      candidate: { ...candidate, layout },
      unconfirmed,
    };
  } catch (error) {
    return {
      kind: 'rejected',
      problems: [MESSAGE.RENDER_FAILED(errorMessage(error))],
      candidate,
      renderFailed: true,
      unconfirmed,
    };
  }
};

const withNotes = (
  body: string,
  unconfirmed: UnconfirmedKeyword[],
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
    ...extra,
  ]
    .filter(Boolean)
    .join('\n\n');

const isNearerFillTarget = (
  candidate: Candidate,
  best?: Candidate,
): boolean => {
  if (!best?.layout) return true;
  if (!candidate.layout) return false;
  const shortfall = resumePdfFillShortfallPx(candidate.layout);
  const bestShortfall = resumePdfFillShortfallPx(best.layout);
  return (
    shortfall < bestShortfall ||
    (shortfall === bestShortfall &&
      candidate.layout.shortLastLines.length <
        best.layout.shortLastLines.length)
  );
};

const buildUpdateEvent = (
  candidate: Candidate,
  validation: ResumeChatValidation,
  context: TailoringContext,
  modelText: string,
): ResultEvent => {
  const attempts = validation.attempts;
  const layout = validation.layout;
  const validatedAttempt = candidate.attempt ?? attempts;
  const validatedStatus = layout?.underfilled
    ? MESSAGE.VALIDATED_SPARSE(
        validatedAttempt,
        Math.round(layout.fillRatio * PERCENT),
        layout.unusedLines,
      )
    : MESSAGE.VALIDATED(validatedAttempt);
  const status =
    validation.status === RESUME_CHAT_VALIDATION_STATUS.VALIDATED
      ? [
          validatedStatus,
          validatedAttempt < attempts ? MESSAGE.KEPT_EARLIER : '',
        ]
          .filter(Boolean)
          .join(' ')
      : MESSAGE.UNVALIDATED(attempts, validation.issues.join(' '));
  return {
    type: RESUME_CHAT_RESPONSE_TYPE.RESUME_UPDATE,
    content: withNotes(
      [candidate.summary, modelText].filter(Boolean).join('\n\n'),
      candidate.unconfirmed,
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
): TailoringContext =>
  toolCalls
    .filter(toolCall =>
      isToolCall(toolCall, RESUME_CHAT_TOOL_NAME.RECORD_TAILORING_CONTEXT),
    )
    .reduce((state, toolCall) => {
      const parsed = tailoringContextSchema.safeParse(
        parseJson(toolCall.function.arguments),
      );
      return parsed.success ? parsed.data : state;
    }, current);

const toolResults = (
  toolCalls: ToolCall[],
  feedback?: { id: string; content: string },
  recorded: string = MESSAGE.TOOL_RECORDED,
): ChatMessageParam[] =>
  toolCalls.map(toolCall => ({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: feedback?.id === toolCall.id ? feedback.content : recorded,
  }));

const gapKey = (gap: UnconfirmedKeyword): string =>
  gap.keyword.trim().toLowerCase();

/**
 * Nothing can be confirmed between revisions of one request, so a gap the model
 * reported on any attempt still applies to the draft that is finally returned.
 */
const mergeGaps = (
  gaps: UnconfirmedKeyword[],
  added: UnconfirmedKeyword[],
): UnconfirmedKeyword[] =>
  added.reduce(
    (merged, gap) =>
      merged.some(existing => gapKey(existing) === gapKey(gap))
        ? merged
        : [...merged, gap],
    gaps,
  );

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
  let context = request.context ?? EMPTY_TAILORING_CONTEXT;

  const skillsNote = await loadSkillsNote();

  const messages: ChatMessageParam[] = [
    {
      role: 'system',
      content: buildSystemPrompt(
        request.resume,
        context,
        request.proposal,
        skillsNote,
      ),
    },
    ...request.messages,
  ];

  let lastDraft: Candidate | undefined;
  let best: Candidate | undefined;
  let lastProblems: string[] = [];
  let gaps: UnconfirmedKeyword[] = [];
  let hasRequestedReply = false;

  const withGaps = (candidate: Candidate): Candidate => ({
    ...candidate,
    unconfirmed: gaps.filter(
      gap => !isKeywordInResume(candidate.resume, gap.keyword),
    ),
  });

  const unvalidated = (attempts: number, modelText: string): ResultEvent =>
    lastDraft
      ? buildUpdateEvent(
          withGaps(lastDraft),
          {
            status: RESUME_CHAT_VALIDATION_STATUS.UNVALIDATED,
            attempts,
            issues: lastProblems,
            layout: lastDraft.layout,
          },
          context,
          modelText,
        )
      : {
          type: RESUME_CHAT_RESPONSE_TYPE.ERROR,
          message: `${MESSAGE.NO_DRAFT} ${lastProblems.join(' ')}`.trim(),
        };

  const validated = (
    candidate: Candidate,
    attempts: number,
    modelText: string,
  ): ResultEvent =>
    buildUpdateEvent(
      withGaps(candidate),
      {
        status: RESUME_CHAT_VALIDATION_STATUS.VALIDATED,
        attempts,
        issues: [],
        layout: candidate.layout,
      },
      context,
      modelText,
    );

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

      context = recordContextCalls(toolCalls, context);

      const updateCall = toolCalls.find(toolCall =>
        isToolCall(toolCall, RESUME_CHAT_TOOL_NAME.UPDATE_RESUME),
      );

      if (!updateCall) {
        if (best) return validated(best, call - 1, modelText);
        if (lastDraft) return unvalidated(call - 1, modelText);
        if (modelText || toolCalls.length === 0) {
          return {
            type: RESUME_CHAT_RESPONSE_TYPE.TEXT,
            content: withNotes(modelText || MESSAGE.EMPTY_REPLY, []),
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
        messages.push(
          message,
          ...toolResults(toolCalls, undefined, MESSAGE.TOOL_RECORDED_ONLY),
        );
        continue;
      }

      const evaluation = await evaluateUpdate(
        updateCall.function.arguments,
        request,
        context,
        userMessages,
        skillsNote,
        call,
        emit,
      );
      gaps = mergeGaps(gaps, evaluation.unconfirmed);

      if (evaluation.kind === 'fits') {
        const repeatsBest =
          !!best &&
          JSON.stringify(best.resume) ===
            JSON.stringify(evaluation.candidate.resume);
        if (isNearerFillTarget(evaluation.candidate, best)) {
          best = evaluation.candidate;
        }
        if (
          repeatsBest ||
          isResumePdfPolished(evaluation.layout) ||
          call === MAX_MODEL_CALLS
        ) {
          return validated(best ?? evaluation.candidate, call, modelText);
        }
        emit({
          type: RESUME_CHAT_RESPONSE_TYPE.PROGRESS,
          message: MESSAGE.PROGRESS_FILLING(call),
        });
        messages.push(
          message,
          ...toolResults(toolCalls, {
            id: updateCall.id,
            content: JSON.stringify({
              status: evaluation.layout.underfilled
                ? UNDERFILLED_STATUS
                : SHORT_LINES_STATUS,
              problems: [describeResumePdfLayout(evaluation.layout)],
              layout: evaluation.layout,
              instructions: evaluation.layout.underfilled
                ? MESSAGE.TOOL_UNDERFILLED
                : MESSAGE.TOOL_SHORT_LINES,
            }),
          }),
        );
        continue;
      }

      lastProblems = evaluation.problems;
      if (evaluation.candidate) lastDraft = evaluation.candidate;

      if (evaluation.renderFailed || call === MAX_MODEL_CALLS) {
        return best
          ? validated(best, call, modelText)
          : unvalidated(call, modelText);
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
            retainedFitLayout: best?.layout,
            instructions: MESSAGE.TOOL_REJECTED,
          }),
        }),
      );
    }
  } catch (error) {
    console.error(MESSAGE.MODEL_FAILED, error);
    if (best) return validated(best, MAX_MODEL_CALLS, '');
    return {
      type: RESUME_CHAT_RESPONSE_TYPE.ERROR,
      message: `${MESSAGE.MODEL_FAILED} ${errorMessage(error)}`,
    };
  }

  return best
    ? validated(best, MAX_MODEL_CALLS, '')
    : unvalidated(MAX_MODEL_CALLS, '');
}
