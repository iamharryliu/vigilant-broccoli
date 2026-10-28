import { z } from 'zod';
import { resumeSchema } from '@vigilant-broccoli/resume';
import type { ResumePdfLayout } from '@vigilant-broccoli/resume';
import {
  RESUME_CHAT_LIMITS,
  RESUME_CHAT_RESPONSE_TYPE,
  RESUME_CHAT_VALIDATION_STATUS,
} from '../app/constants/resume-chat.consts';

const contextText = z.string().max(RESUME_CHAT_LIMITS.MAX_CONTEXT_ITEM_CHARS);
const contextList = (item: z.ZodType<string> = contextText) =>
  z.array(item).max(RESUME_CHAT_LIMITS.MAX_CONTEXT_ITEMS);

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(RESUME_CHAT_LIMITS.MAX_MESSAGE_CHARS),
});

export const tailoringContextSchema = z.object({
  target: contextText,
  requirements: contextList(),
  recruiterInstructions: contextList(),
  confirmedFacts: contextList(),
  deniedSkills: contextList(),
  openQuestions: contextList(),
});
export type TailoringContext = z.infer<typeof tailoringContextSchema>;

export const EMPTY_TAILORING_CONTEXT: TailoringContext = {
  target: '',
  requirements: [],
  recruiterInstructions: [],
  confirmedFacts: [],
  deniedSkills: [],
  openQuestions: [],
};

export const proposalContextSchema = z.object({
  resume: resumeSchema,
  summary: z.string().max(RESUME_CHAT_LIMITS.MAX_MESSAGE_CHARS),
  validated: z.boolean(),
  applied: z.boolean(),
  basedOnCurrentResume: z.boolean(),
});
export type ProposalContext = z.infer<typeof proposalContextSchema>;

export const resumeChatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(RESUME_CHAT_LIMITS.MAX_MESSAGES),
  resume: resumeSchema,
  proposal: proposalContextSchema.nullish(),
  context: tailoringContextSchema.nullish(),
  model: z.string().optional(),
});
export type ResumeChatRequest = z.infer<typeof resumeChatRequestSchema>;

export interface UnconfirmedKeyword {
  keyword: string;
  reason: string;
}

export interface ResumeChatValidation {
  status: (typeof RESUME_CHAT_VALIDATION_STATUS)[keyof typeof RESUME_CHAT_VALIDATION_STATUS];
  attempts: number;
  issues: string[];
  layout?: ResumePdfLayout;
}

export type ResumeChatEvent =
  | { type: typeof RESUME_CHAT_RESPONSE_TYPE.PROGRESS; message: string }
  | { type: typeof RESUME_CHAT_RESPONSE_TYPE.ERROR; message: string }
  | {
      type: typeof RESUME_CHAT_RESPONSE_TYPE.TEXT;
      content: string;
      context: TailoringContext;
    }
  | {
      type: typeof RESUME_CHAT_RESPONSE_TYPE.RESUME_UPDATE;
      content: string;
      resume: z.infer<typeof resumeSchema>;
      validation: ResumeChatValidation;
      unconfirmed: UnconfirmedKeyword[];
      context: TailoringContext;
    };

export type ResumeChatResult = Exclude<
  ResumeChatEvent,
  { type: typeof RESUME_CHAT_RESPONSE_TYPE.PROGRESS }
>;
