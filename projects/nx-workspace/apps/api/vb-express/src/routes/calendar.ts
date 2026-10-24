import { FastifyPluginAsync } from 'fastify';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  calendarParseSchema,
  CalendarParseResult,
} from '@vigilant-broccoli/llm-schemas';
import { callLlm } from '../libs/llm-service.client';
import { extractUrls, fetchLinkedPages } from '../libs/page-content';

const DEFAULT_TIME_ZONE = 'America/New_York';

const ERROR_NO_INPUT = 'Provide text or at least one image';
const ERROR_NO_EVENTS = 'Could not extract any events from input';

type ParseBody = {
  text?: string;
  images?: { name: string; base64: string; mimeType: string }[];
  timeZone?: string;
};

// Appended deterministically rather than via the prompt so the pasted link
// always survives into the event description.
const withLinks = (description: string | undefined, links: string[]): string =>
  [description?.trim(), ...links.filter(l => !description?.includes(l))]
    .filter(Boolean)
    .join('\n\n');

const buildSystemPrompt = (timeZone: string) => {
  const now = new Date();
  return `You extract calendar events from text and images (screenshots of invites, posters, emails, messages).

Return JSON matching the schema: { "events": [ ... ] }. Include one entry per distinct event. If no event is present, return an empty array.

Multi-event rules:
- A single page often describes more than one event. Extract every one of them, including sessions described only in body prose, in a trailing paragraph, or under a heading aimed at a different audience.
- Sessions that differ in start/end time, age limit, target audience, or format are distinct events even when they share a title, venue and date range. Never merge them into one entry and never drop the secondary one.
- When the input lists many individual occurrences of the same session (an "all dates" / "alla tillfällen" style list), return ONE recurring event with an RRULE covering them, not one entry per occurrence. Set start/end from the first occurrence and add UNTIL for the last.
- Input may be in any language. Keep the event name in its original language.

Per-event rules:
- summary: short event title (required, never empty)
- description: any extra context, or empty string
- location: physical address, venue, or video link, or empty string
- start, end: ISO 8601 strings. For timed events, include time and offset (e.g. "2026-05-12T19:00:00-04:00"). For all-day events, use YYYY-MM-DD
- timeZone: IANA tz database name (default "${timeZone}")
- allDay: true if no specific time was given
- If end is missing, default to start + 1 hour
- Resolve relative dates ("Friday", "next week") against the current time: ${now.toISOString()}
- recurrence: array of RFC 5545 RRULE strings (e.g. ["RRULE:FREQ=WEEKLY;BYDAY=TU"] for "every Tuesday"). Include UNTIL when the input gives an end date (e.g. ["RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261031T235959Z"]). Empty array if the event does not repeat
- When the input gives a date without a year, infer the year from the current time so the date is the next upcoming one
- Do not invent events; only return what is actually present in the input.`;
};

const calendarRoutes: FastifyPluginAsync = async app => {
  app.post('/parse', async (req, reply) => {
    const {
      text,
      images,
      timeZone = DEFAULT_TIME_ZONE,
    } = req.body as ParseBody;

    if (!text?.trim() && (!images || images.length === 0)) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_NO_INPUT });
    }

    const linkedPages = text?.trim() ? await fetchLinkedPages(text) : [];
    const content = [text?.trim(), ...linkedPages]
      .filter(Boolean)
      .join('\n\n--- Linked page ---\n');

    const userPrompt = content
      ? `Extract all calendar events from the following content:\n\n${content}`
      : 'Extract all calendar events from the attached image(s).';

    const { outputs } = await callLlm<{ outputs: CalendarParseResult[] }>({
      userPrompt,
      systemPrompt: buildSystemPrompt(timeZone),
      images,
      model: LLM_MODEL.GPT_4O_MINI,
      jsonSchema: calendarParseSchema,
    });

    const links = text ? extractUrls(text) : [];
    const events = outputs[0].events
      .filter(e => e.summary && e.start)
      .map(e => ({ ...e, description: withLinks(e.description, links) }));
    if (events.length === 0) {
      return reply
        .code(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY)
        .send({ error: ERROR_NO_EVENTS });
    }

    return { events };
  });
};

export default calendarRoutes;
