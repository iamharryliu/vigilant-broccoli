import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  HTTP_STATUS_CODES,
  OPENAI_MODEL,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getVbExpressApiKey } from '../../../../lib/vb-express';
import {
  createAdminClient,
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOMES_TABLE = 'homes';
const HOME_MEMBERS_TABLE = 'home_members';
const ACCEPTED_STATUS = 'accepted';
const DEFAULT_BOARD_KEY = 'family';
const MAX_DOCUMENT_LENGTH = 100_000;

const SYSTEM_PROMPT =
  'You are an editing assistant for a shared household notes document. ' +
  'You receive the current document and the conversation so far. Answer ' +
  'questions about the document conversationally. When the user asks for a ' +
  'change (rewrite, organize, fix spelling, add content, etc.), put the ' +
  'COMPLETE updated document in updatedDocument and briefly describe what ' +
  'you changed in reply. Preserve all content the user did not ask you to ' +
  'change, including its formatting. When no edit is requested, set ' +
  'updatedDocument to null. Never wrap the document in code fences.';

const ASSISTANT_SCHEMA = {
  name: 'whiteboard_assistant_turn',
  schema: {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      updatedDocument: { type: ['string', 'null'] },
    },
    required: ['reply', 'updatedDocument'],
    additionalProperties: false,
  },
};

const FALLBACK_REPLY =
  'Sorry, the document assistant is unavailable right now. Please try again later.';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const RequestSchema = z.object({
  homeId: z.union([z.string(), z.number()]),
  boardKey: z.string().min(1).default(DEFAULT_BOARD_KEY),
  document: z.string().max(MAX_DOCUMENT_LENGTH),
  messages: z.array(MessageSchema).min(1),
});

const toPrompt = (
  document: string,
  messages: z.infer<typeof MessageSchema>[],
): string =>
  `Current document:\n<<<DOCUMENT\n${document}\nDOCUMENT>>>\n\nConversation:\n` +
  messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

const unavailable = () =>
  Response.json(
    { error: FALLBACK_REPLY },
    { status: HTTP_STATUS_CODES.BAD_GATEWAY },
  );

export async function POST(request: NextRequest) {
  const accessToken = getBearerToken(request);
  const {
    data: { user },
  } = await createServerClient(accessToken).auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const { homeId, document, messages } = parsed.data;

  const admin = createAdminClient();
  const [{ data: ownedHome }, { data: membership }] = await Promise.all([
    admin
      .from(HOMES_TABLE)
      .select('id')
      .eq('id', homeId)
      .eq('user_id', user.id)
      .maybeSingle(),
    admin
      .from(HOME_MEMBERS_TABLE)
      .select('id')
      .eq('home_id', homeId)
      .eq('user_id', user.id)
      .eq('status', ACCEPTED_STATUS)
      .maybeSingle(),
  ]);
  if (!ownedHome && !membership) {
    return Response.json(
      { error: 'Forbidden' },
      { status: HTTP_STATUS_CODES.FORBIDDEN },
    );
  }

  const vbExpressUrl = getEnvironmentVariable('VB_EXPRESS_URL');
  if (!vbExpressUrl) return unavailable();

  const res = await fetch(`${vbExpressUrl}/${VB_EXPRESS_ENDPOINT.LLM}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getVbExpressApiKey(),
    },
    body: JSON.stringify({
      model: OPENAI_MODEL.GPT_4O_MINI,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: toPrompt(document, messages),
      jsonSchema: ASSISTANT_SCHEMA,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    console.warn(`whiteboard assistant LLM ${res?.status}`);
    return unavailable();
  }

  const { outputs } = await res.json();
  const turn = outputs?.[0] ?? {};
  if (typeof turn.reply !== 'string') return unavailable();

  return Response.json({
    reply: turn.reply,
    updatedDocument:
      typeof turn.updatedDocument === 'string' &&
      turn.updatedDocument !== document
        ? turn.updatedDocument
        : null,
  });
}
