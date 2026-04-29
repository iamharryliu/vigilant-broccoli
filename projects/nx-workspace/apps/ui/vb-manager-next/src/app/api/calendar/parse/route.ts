import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL, LLMImage } from '@vigilant-broccoli/common-js';

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

const responseSchema = z.object({
  events: z.array(eventSchema),
});

type ParsedResponse = z.infer<typeof responseSchema>;

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
  const currentDateIso = now.toISOString();
  return `You extract calendar events from text and images (screenshots of invites, posters, emails, messages).

Return JSON matching the schema: { "events": [ ... ] }. Include one entry per distinct event mentioned in the input. If only one event is present, return an array of length 1. If no event is present, return an empty array.

Per-event rules:
- summary: short event title (required, never empty)
- description: any extra context not captured by other fields, or empty string
- location: physical address, venue, or video link, or empty string
- start, end: ISO 8601 strings. For timed events, include time and offset (e.g. "2026-05-12T19:00:00-04:00"). For all-day events, use YYYY-MM-DD
- timeZone: IANA tz database name (default "${timeZone}")
- allDay: true if no specific time was given
- If end is missing, default to start + 1 hour
- Resolve relative dates ("Friday", "next week") against the current time: ${currentDateIso}
- Two occurrences of the same recurring meeting on different dates should be returned as separate events.
- Do not invent events; only return what is actually present in the input.`;
};

const buildUserPrompt = (text?: string) => {
  const trimmed = text?.trim();
  if (trimmed) {
    return `Extract the calendar event from the following content:\n\n${trimmed}`;
  }
  return 'Extract the calendar event from the attached image(s).';
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ParseRequest;
    const { text, images, timeZone = DEFAULT_TIME_ZONE } = body;

    if (!text?.trim() && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: 'Provide text or at least one image' },
        { status: 400 },
      );
    }

    const llmImages: LLMImage[] | undefined = images?.map((img, index) => ({
      name: `image_${index}`,
      base64: img.data,
      mimeType: img.mimeType,
    }));

    const result = await LLMService.prompt<ParsedResponse>({
      prompt: {
        userPrompt: buildUserPrompt(text),
        systemPrompt: buildSystemPrompt(timeZone),
        images: llmImages,
      },
      modelConfig: {
        model: LLM_MODEL.GPT_4O,
        temperature: 0,
      },
      responseFormat: {
        zod: responseSchema,
      },
    });

    const events = result.data.events.filter(e => e.summary && e.start);
    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any events from input' },
        { status: 422 },
      );
    }

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse' },
      { status: 500 },
    );
  }
}
