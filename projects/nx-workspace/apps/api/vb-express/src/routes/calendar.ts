import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

const router = Router();

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

type ParsedResponse = z.infer<typeof responseSchema>;

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

router.post('/parse', async (req: Request, res: Response) => {
  const {
    text,
    images,
    timeZone = DEFAULT_TIME_ZONE,
  } = req.body as {
    text?: string;
    images?: { name: string; base64: string; mimeType: string }[];
    timeZone?: string;
  };

  if (!text?.trim() && (!images || images.length === 0)) {
    return res
      .status(400)
      .json({ error: 'Provide text or at least one image' });
  }

  const userPrompt = text?.trim()
    ? `Extract the calendar event from the following content:\n\n${text.trim()}`
    : 'Extract the calendar event from the attached image(s).';

  const result = await LLMService.prompt<ParsedResponse>({
    prompt: { userPrompt, systemPrompt: buildSystemPrompt(timeZone), images },
    modelConfig: { model: LLM_MODEL.GPT_4O, temperature: 0 },
    responseFormat: { zod: responseSchema },
  });

  const events = result.data.events.filter(e => e.summary && e.start);
  if (events.length === 0) {
    return res
      .status(422)
      .json({ error: 'Could not extract any events from input' });
  }

  return res.json({ events });
});

export default router;
