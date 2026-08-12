import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import {
  HTTP_STATUS_CODES,
  LLM_MODEL,
  LLM_MODELS,
  LLMModel,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { ResumeData } from '@vigilant-broccoli/resume';
import {
  RESUME_CHAT_RESPONSE_TYPE,
  RESUME_CHAT_TOOL_NAME,
} from '../../../constants/resume-chat.consts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ERROR = {
  MISSING_MESSAGES: 'Missing messages',
  MISSING_RESUME: 'Missing resume',
} as const;

const DEFAULT_SUMMARY = 'Here is the updated resume.';

const RESUME_LINK_SCHEMA = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    url: { type: 'string' },
  },
  required: ['label', 'url'],
} as const;

const EXPERIENCE_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    role: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    bullets: { type: 'array', items: { type: 'string' } },
  },
  required: ['company', 'role', 'startDate', 'endDate', 'bullets'],
} as const;

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    basics: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        title: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        links: { type: 'array', items: RESUME_LINK_SCHEMA },
      },
      required: ['name', 'title', 'email', 'phone', 'links'],
    },
    workExperience: { type: 'array', items: EXPERIENCE_SCHEMA },
    projectExperience: { type: 'array', items: EXPERIENCE_SCHEMA },
    skills: {
      type: 'object',
      properties: {
        technical: { type: 'array', items: { type: 'string' } },
      },
      required: ['technical'],
    },
  },
  required: ['basics', 'workExperience', 'projectExperience', 'skills'],
} as const;

const UPDATE_RESUME_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: RESUME_CHAT_TOOL_NAME.UPDATE_RESUME,
    description:
      'Apply edits to the resume. Call this only when the user asks to change the resume. Return the COMPLETE updated resume object, preserving every field the user did not ask to change.',
    parameters: {
      type: 'object',
      properties: {
        resume: RESUME_SCHEMA,
        summary: {
          type: 'string',
          description: 'A short, one-sentence summary of the changes made.',
        },
      },
      required: ['resume', 'summary'],
    },
  },
};

const buildSystemPrompt = (resume: ResumeData): string =>
  [
    'You are a resume-editing assistant. You help the user discuss and improve their resume.',
    'The current resume JSON is provided below. When the user only asks questions or wants feedback, respond conversationally in plain text and do NOT call any tool.',
    `When the user asks you to make an edit, call the "${RESUME_CHAT_TOOL_NAME.UPDATE_RESUME}" function with the complete updated resume, changing only what was requested and keeping everything else identical.`,
    'Keep suggestions concise and focused on impact.',
    '',
    'Current resume JSON:',
    JSON.stringify(resume, null, 2),
  ].join('\n');

const buildOpenAIMessages = (
  messages: Message[],
  systemPrompt: string,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => [
  { role: 'system', content: systemPrompt },
  ...messages.map(m => ({ role: m.role, content: m.content })),
];

const jsonResponse = (payload: unknown, status = HTTP_STATUS_CODES.OK) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const buildResponsePayload = (
  choice: OpenAI.Chat.Completions.ChatCompletion.Choice,
) => {
  const toolCall = choice.message.tool_calls?.[0];

  if (toolCall?.function.name === RESUME_CHAT_TOOL_NAME.UPDATE_RESUME) {
    const args = JSON.parse(toolCall.function.arguments) as {
      resume: ResumeData;
      summary?: string;
    };
    return {
      type: RESUME_CHAT_RESPONSE_TYPE.RESUME_UPDATE,
      resume: args.resume,
      summary: args.summary || DEFAULT_SUMMARY,
    };
  }

  return {
    type: RESUME_CHAT_RESPONSE_TYPE.TEXT,
    content: choice.message.content ?? '',
  };
};

export async function POST(request: NextRequest) {
  const { messages, resume, model } = (await request.json()) as {
    messages: Message[];
    resume: ResumeData;
    model?: LLMModel;
  };

  if (!messages || messages.length === 0) {
    return jsonResponse(
      { error: ERROR.MISSING_MESSAGES },
      HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
  if (!resume) {
    return jsonResponse(
      { error: ERROR.MISSING_RESUME },
      HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const selectedModel =
    model && LLM_MODELS.includes(model) ? model : LLM_MODEL.GPT_4O;

  const openai = new OpenAI({
    apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
  });

  const completion = await openai.chat.completions.create({
    model: selectedModel,
    messages: buildOpenAIMessages(messages, buildSystemPrompt(resume)),
    tools: [UPDATE_RESUME_TOOL],
    tool_choice: 'auto',
  });

  return jsonResponse(buildResponsePayload(completion.choices[0]));
}
