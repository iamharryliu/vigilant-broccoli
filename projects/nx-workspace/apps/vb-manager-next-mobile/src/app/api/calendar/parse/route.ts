import { NextRequest, NextResponse } from 'next/server';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import { z } from 'zod';

export const runtime = 'nodejs';

const DEFAULT_TIME_ZONE = 'America/New_York';

const eventSchema = z.object({
  summary: z.string(),
  description: z.string(),
  location: z.string(),
  start: z.string(),
  end: z.string(),
  timeZone: z.string(),
  allDay: z.boolean(),
});

const responseSchema = z.object({ events: z.array(eventSchema) });

interface MessageImage {
  data: string;
  mimeType: string;
}

interface ParseRequest {
  text?: string;
  images?: MessageImage[];
  timeZone?: string;
}

const buildSystemPrompt = (timeZone: string) => {
  const now = new Date();
  return `You extract calendar events from text and images (screenshots of invites, posters, emails, messages).

Return JSON matching the schema: { "events": [ ... ] }. Include one entry per distinct event. If no event is present, return an empty array.

Per-event rules:
- summary: short event title (required, never empty)
- description: any extra context, or empty string
- location: physical address, venue, or video link, or empty string
- start, end: ISO 8601 strings. For timed events, include time and offset (e.g. "2026-05-12T19:00:00-04:00"). For all-day events, use YYYY-MM-DD
- timeZone: IANA tz database name (default "${timeZone}")
- allDay: true if no specific time was given
- If end is missing, default to start + 1 hour
- Resolve relative dates ("Friday", "next week") against the current time: ${now.toISOString()}
- Do not invent events; only return what is actually present in the input.`;
};

export async function POST(request: NextRequest) {
  const {
    text,
    images,
    timeZone = DEFAULT_TIME_ZONE,
  } = (await request.json()) as ParseRequest;

  if (!text?.trim() && (!images || images.length === 0)) {
    return NextResponse.json(
      { error: 'Provide text or at least one image' },
      { status: 400 },
    );
  }

  const userPrompt = text?.trim()
    ? `Extract the calendar event from the following content:\n\n${text.trim()}`
    : 'Extract the calendar event from the attached image(s).';

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt,
        systemPrompt: buildSystemPrompt(timeZone),
        model: LLM_MODEL.GPT_4O,
        images: (images ?? []).map(img => ({
          name: 'image',
          base64: img.data,
          mimeType: img.mimeType,
        })),
        responseFormat: 'json',
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to parse LLM response' },
      { status: 422 },
    );
  }

  const { outputs } = await res.json();
  const parsed = responseSchema.safeParse(outputs?.[0]);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Failed to parse LLM response' },
      { status: 422 },
    );
  }

  const events = parsed.data.events.filter(e => e.summary && e.start);
  if (events.length === 0) {
    return NextResponse.json(
      { error: 'Could not extract any events from input' },
      { status: 422 },
    );
  }

  return NextResponse.json({ events });
}
