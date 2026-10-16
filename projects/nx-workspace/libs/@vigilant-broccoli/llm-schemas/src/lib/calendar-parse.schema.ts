import type { FromSchema } from 'json-schema-to-ts';

export const calendarParseSchema = {
  name: 'calendar_parse',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['events'],
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'summary',
            'description',
            'location',
            'start',
            'end',
            'timeZone',
            'allDay',
            'recurrence',
          ],
          properties: {
            summary: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            start: { type: 'string' },
            end: { type: 'string' },
            timeZone: { type: 'string' },
            allDay: { type: 'boolean' },
            recurrence: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
} as const;

export type CalendarParseResult = FromSchema<typeof calendarParseSchema.schema>;
