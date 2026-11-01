import { requestLlmJson } from './llm-json';
import { ScrapedEvent } from './scraped-event.types';

const LOCALIZE_CONCURRENCY = 5;
const VENUE_SEPARATOR = ' @ ';
const PLACE_PART_SEPARATOR = ', ';
const SOURCE_LANGUAGE_FALLBACK =
  'the same language the source event is written in';

const SYSTEM_PROMPT = `You write Google Calendar entries for events scraped from the web (Facebook, calendar feeds, event pages).
Return a JSON object with "title", "venue", "city", and "description".
- "title": the event's real name, concise, taken from the scraped title and description. Scraped titles can be UI text (e.g. "More", "Details") or a date — ignore those and name the event from the description instead. No dates, venue, emojis, or surrounding quotes.
- "venue": the short name of the place it's held (e.g. a bar, studio, or hall name), from the location or description. Not a bare city, country, or street address. Empty string if no venue is named.
- "city": the city the event takes place in, from the location or description (e.g. "Copenhagen"). Only the city name, no country. Empty string if it cannot be determined.
- "description": the event description faithfully translated, keeping every practical detail (schedule, prices, addresses, links, contacts). Plain text, no markdown. Empty string if there is no description.
Write every field in the requested language.`;

const LOCALIZE_SCHEMA = {
  name: 'calendar_event_text',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'venue', 'city', 'description'],
    properties: {
      title: { type: 'string' },
      venue: { type: 'string' },
      city: { type: 'string' },
      description: { type: 'string' },
    },
  },
} as const;

interface LocalizedText {
  title: string;
  venue: string;
  city: string;
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
  const localized = await requestLlmJson<LocalizedText>({
    userPrompt: buildUserPrompt(event, language),
    systemPrompt: SYSTEM_PROMPT,
    jsonSchema: LOCALIZE_SCHEMA,
  });
  const title = localized?.title?.trim() || event.title;
  const place = [localized?.venue?.trim(), localized?.city?.trim()]
    .filter(Boolean)
    .join(PLACE_PART_SEPARATOR);
  return {
    ...event,
    title: place ? `${title}${VENUE_SEPARATOR}${place}` : title,
    description: localized?.description?.trim() || event.description,
  };
};

export const localizeEvents = async (
  events: ScrapedEvent[],
  language?: string,
  onProgress?: (done: number, total: number) => void,
) => {
  const localized: ScrapedEvent[] = [];
  for (let index = 0; index < events.length; index += LOCALIZE_CONCURRENCY) {
    const batch = events.slice(index, index + LOCALIZE_CONCURRENCY);
    localized.push(
      ...(await Promise.all(
        batch.map(event => localizeEvent(event, language)),
      )),
    );
    onProgress?.(localized.length, events.length);
  }
  return localized;
};
