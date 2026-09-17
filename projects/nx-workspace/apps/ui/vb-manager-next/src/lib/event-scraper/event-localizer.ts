import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODEL,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { getVbExpressApiKey } from '../vb-express';
import { ScrapedEvent } from './facebook-events.scraper';

const LOCALIZE_CONCURRENCY = 5;
const VENUE_SEPARATOR = ' @ ';
const SOURCE_LANGUAGE_FALLBACK =
  'the same language the source event is written in';

const SYSTEM_PROMPT = `You write Google Calendar entries for events scraped from Facebook.
Return a JSON object with "title", "venue", and "description".
- "title": the event's real name, concise, taken from the scraped title and description. Scraped titles can be UI text (e.g. "More", "Details") or a date — ignore those and name the event from the description instead. No dates, venue, emojis, or surrounding quotes.
- "venue": the short name of the place it's held (e.g. a bar, studio, or hall name), from the location or description. Not a bare city, country, or street address. Empty string if no venue is named.
- "description": the event description faithfully translated, keeping every practical detail (schedule, prices, addresses, links, contacts). Plain text, no markdown. Empty string if there is no description.
Write both fields in the requested language.`;

const LOCALIZE_SCHEMA = {
  name: 'calendar_event_text',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'venue', 'description'],
    properties: {
      title: { type: 'string' },
      venue: { type: 'string' },
      description: { type: 'string' },
    },
  },
} as const;

interface LocalizedText {
  title: string;
  venue: string;
  description: string;
}

const buildUserPrompt = (event: ScrapedEvent, language?: string) =>
  [
    `Language: ${language || SOURCE_LANGUAGE_FALLBACK}`,
    `Scraped title: ${event.title}`,
    event.location && `Location: ${event.location}`,
    `Description:\n${event.description ?? ''}`,
  ]
    .filter(Boolean)
    .join('\n');

// A failed LLM call keeps the scraped text rather than failing the whole sync.
const localizeEvent = async (
  event: ScrapedEvent,
  language?: string,
): Promise<ScrapedEvent> => {
  const response = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        [API_KEY_HEADER]: getVbExpressApiKey(),
      },
      body: JSON.stringify({
        userPrompt: buildUserPrompt(event, language),
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema: LOCALIZE_SCHEMA,
      }),
    },
  );
  if (!response.ok) return event;

  const { outputs } = (await response.json()) as { outputs: LocalizedText[] };
  const [localized] = outputs ?? [];
  const title = localized?.title?.trim() || event.title;
  const venue = localized?.venue?.trim();
  return {
    ...event,
    title: venue ? `${title}${VENUE_SEPARATOR}${venue}` : title,
    description: localized?.description?.trim() || event.description,
  };
};

export const localizeEvents = async (
  events: ScrapedEvent[],
  language?: string,
) => {
  const localized: ScrapedEvent[] = [];
  for (let index = 0; index < events.length; index += LOCALIZE_CONCURRENCY) {
    const batch = events.slice(index, index + LOCALIZE_CONCURRENCY);
    localized.push(
      ...(await Promise.all(
        batch.map(event => localizeEvent(event, language)),
      )),
    );
  }
  return localized;
};
