import { CALENDAR_DRAFT_MARKER } from '../constants/chatbot.consts';
import type { EventDraft } from '../components/event-draft-card.component';
import type { Message } from '../components/chatbot/chatbot.types';

const LINK_PATTERN = /https?:\/\/\S+/i;
const CALENDAR_WORDS_PATTERN =
  /\b(calendar|event|schedule|rsvp|add this|put this)\b/i;
const RECENT_LINK_MESSAGE_COUNT = 6;

// The chat model cannot open links, so a pasted link that is bare or mentions
// calendar intent goes to the calendar parser, which fetches the page.
export const isCalendarLinkMessage = (text: string): boolean => {
  const trimmed = text.trim();
  if (!LINK_PATTERN.test(trimmed)) return false;
  const withoutLinks = trimmed
    .replace(new RegExp(LINK_PATTERN, 'gi'), '')
    .trim();
  return !withoutLinks || CALENDAR_WORDS_PATTERN.test(withoutLinks);
};

// "Add that to my calendar" has no link of its own, so reuse one from a recent
// user message. A pending draft means the user is correcting it, not starting
// a new extraction.
export const findRecentLink = (
  messages: Message[],
  text: string,
): string | null => {
  if (LINK_PATTERN.test(text) || !CALENDAR_WORDS_PATTERN.test(text))
    return null;
  if (messages.some(m => m.eventDraft && m.eventStatus === 'draft'))
    return null;
  const recentUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-RECENT_LINK_MESSAGE_COUNT)
    .reverse();
  for (const message of recentUserMessages) {
    const link = message.content.match(LINK_PATTERN)?.[0];
    if (link) return link;
  }
  return null;
};

const serializeEventDraft = (event: EventDraft): string => {
  const parts = [
    `Title: ${event.summary}`,
    `Start: ${event.start}`,
    event.end ? `End: ${event.end}` : null,
    event.location ? `Location: ${event.location}` : null,
    event.description ? `Description: ${event.description}` : null,
    event.allDay ? 'All day: yes' : null,
    event.timeZone ? `Timezone: ${event.timeZone}` : null,
    event.recurrence?.length ? `Repeats: ${event.recurrence.join(', ')}` : null,
  ].filter(Boolean);
  return `${CALENDAR_DRAFT_MARKER}\n${parts.join('\n')}`;
};

export const buildEventDraftMessages = (events: EventDraft[]): Message[] => {
  const headerContent =
    events.length === 1
      ? 'Review the event below before creating it.'
      : `Review the ${events.length} events below before creating them.`;
  return [
    { role: 'assistant', content: headerContent, isStreaming: false },
    ...events.map((event): Message => ({
      role: 'assistant',
      content: serializeEventDraft(event),
      isStreaming: false,
      eventDraft: event,
      eventStatus: 'draft',
    })),
  ];
};

export const isCommandMessage = (message: Message): boolean =>
  message.displayContent !== undefined;
