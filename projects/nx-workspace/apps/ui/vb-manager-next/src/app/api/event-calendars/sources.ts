import {
  detectEventSourceType,
  EVENT_SOURCE_TYPE,
  EventCalendarSource,
} from '../../constants/event-calendars';

interface IncomingSource {
  url?: string;
  sourceType?: string;
}

// The client sends raw URLs; the source type is inferred so adding a new
// scraper only means teaching detectEventSourceType about its URL shape.
export const normalizeSources = (
  sources: IncomingSource[],
): EventCalendarSource[] =>
  sources
    .map(source => source.url?.trim())
    .filter((url): url is string => !!url)
    .map(url => ({
      url,
      sourceType:
        detectEventSourceType(url) ?? EVENT_SOURCE_TYPE.FACEBOOK_GROUP,
    }));
