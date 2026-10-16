import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { HTTP_HEADERS, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  RESUME_CHAT_MODEL,
  RESUME_CHAT_RESPONSE_TYPE,
} from '../../../constants/resume-chat.consts';
import {
  resumeChatRequestSchema,
  ResumeChatEvent,
} from '../../../../lib/resume-chat.schema';
import { runResumeChat } from './resume-chat.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NDJSON_CONTENT_TYPE = 'application/x-ndjson';
const MAX_ERROR_DETAILS = 10;

const ERROR = {
  INVALID_BODY: 'Invalid request body',
  INVALID_REQUEST: 'Invalid resume chat request',
  UNEXPECTED: 'Resume chat failed unexpectedly',
} as const;

const jsonResponse = (payload: unknown, status = HTTP_STATUS_CODES.OK) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
  });

const encoder = new TextEncoder();

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => undefined);
  if (body === undefined) {
    return jsonResponse(
      { error: ERROR.INVALID_BODY },
      HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const parsed = resumeChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      {
        error: ERROR.INVALID_REQUEST,
        details: parsed.error.issues
          .slice(0, MAX_ERROR_DETAILS)
          .map(issue => `${issue.path.join('.')}: ${issue.message}`),
      },
      HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
  const chatRequest = parsed.data;
  const model = RESUME_CHAT_MODEL;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ResumeChatEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const openai = new OpenAI({
          apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
        });
        emit(
          await runResumeChat({ openai, model, request: chatRequest, emit }),
        );
      } catch (error) {
        console.error(ERROR.UNEXPECTED, error);
        emit({
          type: RESUME_CHAT_RESPONSE_TYPE.ERROR,
          message: ERROR.UNEXPECTED,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': NDJSON_CONTENT_TYPE },
  });
}
