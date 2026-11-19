import { FastifyPluginAsync } from 'fastify';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  calendarParseSchema,
  CalendarParseResult,
} from '@vigilant-broccoli/llm-schemas';
import { callLlm } from '../libs/llm-service.client';
import { extractUrls, fetchLinkedPages } from '../libs/page-content';
import { buildSystemPrompt, toCalendarEvents } from '../libs/calendar-parse';

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
    const events = toCalendarEvents(outputs[0].events, timeZone).map(e => ({
      ...e,
      description: withLinks(e.description, links),
    }));
    if (events.length === 0) {
      return reply
        .code(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY)
        .send({ error: ERROR_NO_EVENTS });
    }

    return { events };
  });
};

export default calendarRoutes;
