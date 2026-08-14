import { getVbExpressApiKey } from '../../../../lib/vb-express';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  OPENAI_MODEL,
  HTTP_STATUS_CODES,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GROCERY_TABLE = 'grocery_items';
const KITCHEN_CHORES_TABLE = 'kitchen_chore_items';
const CALENDAR_EVENTS_TABLE = 'calendar_events';

const SYSTEM_PROMPT =
  'You are a friendly kitchen and food assistant for a shared household. ' +
  'Chat with the user about meals, recipes, nutrition, and cooking. When the ' +
  'conversation implies concrete shopping or kitchen tasks, call the ' +
  'appropriate function to add them: put ingredients or things to buy in ' +
  'groceryItems, and cooking/cleaning/prep tasks in kitchenChores. When the ' +
  'user asks to schedule or plan something on the calendar (e.g. "add taco ' +
  'night on Friday" or "remind me to defrost the chicken tomorrow at 6pm"), ' +
  'add it to events with an ISO 8601 start and end datetime including a ' +
  'timezone offset; default to a one-hour duration unless the user specifies ' +
  'otherwise, and set allDay true only for whole-day events. Only add items ' +
  'and events the user clearly wants; leave the arrays empty otherwise. Each ' +
  'grocery or chore entry must be a short, concrete line, e.g. "500g chicken ' +
  'thigh" or "Marinate chicken overnight". Always write a helpful ' +
  'conversational reply.';

const CHAT_SCHEMA = {
  name: 'food_chat_turn',
  schema: {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      groceryItems: { type: 'array', items: { type: 'string' } },
      kitchenChores: { type: 'array', items: { type: 'string' } },
      events: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            start: { type: 'string' },
            end: { type: 'string' },
            allDay: { type: 'boolean' },
          },
          required: ['title', 'start', 'end', 'allDay'],
          additionalProperties: false,
        },
      },
    },
    required: ['reply', 'groceryItems', 'kitchenChores', 'events'],
    additionalProperties: false,
  },
};

const FALLBACK_REPLY =
  'Sorry, the food assistant is unavailable right now. Please try again later.';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const RequestSchema = z.object({
  homeId: z.union([z.string(), z.number()]),
  messages: z.array(MessageSchema).min(1),
});

type ChatEvent = {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

type ChatTurn = {
  reply: string;
  groceryItems: string[];
  kitchenChores: string[];
  events: ChatEvent[];
};

const toTranscript = (messages: z.infer<typeof MessageSchema>[]): string =>
  messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    : [];

const toEventList = (value: unknown): ChatEvent[] =>
  Array.isArray(value)
    ? value.flatMap(v => {
        const e = (v ?? {}) as Record<string, unknown>;
        const title = typeof e.title === 'string' ? e.title.trim() : '';
        const start = typeof e.start === 'string' ? e.start : '';
        const end = typeof e.end === 'string' ? e.end : '';
        if (!title || isNaN(Date.parse(start)) || isNaN(Date.parse(end)))
          return [];
        return [{ title, start, end, allDay: e.allDay === true }];
      })
    : [];

const runChatTurn = async (
  messages: z.infer<typeof MessageSchema>[],
): Promise<ChatTurn> => {
  const vbExpressUrl = getEnvironmentVariable('VB_EXPRESS_URL');
  if (!vbExpressUrl) {
    return {
      reply: FALLBACK_REPLY,
      groceryItems: [],
      kitchenChores: [],
      events: [],
    };
  }

  const res = await fetch(`${vbExpressUrl}/${VB_EXPRESS_ENDPOINT.LLM}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getVbExpressApiKey(),
    },
    body: JSON.stringify({
      model: OPENAI_MODEL.GPT_4O_MINI,
      systemPrompt: `${SYSTEM_PROMPT} The current date and time is ${new Date().toISOString()}.`,
      userPrompt: toTranscript(messages),
      jsonSchema: CHAT_SCHEMA,
    }),
  });

  if (!res.ok) {
    console.warn(`food-planner chat LLM ${res.status}`);
    return {
      reply: FALLBACK_REPLY,
      groceryItems: [],
      kitchenChores: [],
      events: [],
    };
  }

  const { outputs } = await res.json();
  const turn = outputs?.[0] ?? {};
  return {
    reply: typeof turn.reply === 'string' ? turn.reply : FALLBACK_REPLY,
    groceryItems: toStringList(turn.groceryItems),
    kitchenChores: toStringList(turn.kitchenChores),
    events: toEventList(turn.events),
  };
};

const insertItems = async (
  supabase: ReturnType<typeof createServerClient>,
  table: string,
  homeId: string | number,
  names: string[],
): Promise<string[]> => {
  if (names.length === 0) return [];
  const rows = names.map(name => ({ name, position: 0, home_id: homeId }));
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) {
    console.warn(`food-planner chat insert ${table}: ${error.message}`);
    return [];
  }
  return (data ?? []).map(row => row.name as string);
};

const insertEvents = async (
  supabase: ReturnType<typeof createServerClient>,
  homeId: string | number,
  userId: string,
  events: ChatEvent[],
): Promise<string[]> => {
  if (events.length === 0) return [];
  const rows = events.map(e => ({
    title: e.title,
    start: e.start,
    end: e.end,
    all_day: e.allDay,
    kitchen_event: true,
    home_id: homeId,
    user_id: userId,
  }));
  const { data, error } = await supabase
    .from(CALENDAR_EVENTS_TABLE)
    .insert(rows)
    .select();
  if (error) {
    console.warn(`food-planner chat insert events: ${error.message}`);
    return [];
  }
  return (data ?? []).map(row => row.title as string);
};

export async function POST(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const { homeId, messages } = parsed.data;
  const turn = await runChatTurn(messages);

  const [groceryItems, kitchenChores, events] = await Promise.all([
    insertItems(supabase, GROCERY_TABLE, homeId, turn.groceryItems),
    insertItems(supabase, KITCHEN_CHORES_TABLE, homeId, turn.kitchenChores),
    insertEvents(supabase, homeId, user.id, turn.events),
  ]);

  return Response.json({
    reply: turn.reply,
    added: { groceryItems, kitchenChores, events },
  });
}
