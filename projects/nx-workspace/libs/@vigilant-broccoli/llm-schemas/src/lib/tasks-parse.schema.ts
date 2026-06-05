import type { FromSchema } from 'json-schema-to-ts';

export const tasksParseSchema = {
  name: 'tasks_parse',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['items', 'suggestedListId'],
    properties: {
      items: { type: 'array', items: { type: 'string' } },
      suggestedListId: { type: ['string', 'null'] },
    },
  },
} as const;

export type TasksParseResult = FromSchema<typeof tasksParseSchema.schema>;

export const tasksParseTextSchema = {
  name: 'tasks_parse_text',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['items'],
    properties: {
      items: { type: 'array', items: { type: 'string' } },
    },
  },
} as const;

export type TasksParseTextResult = FromSchema<
  typeof tasksParseTextSchema.schema
>;
