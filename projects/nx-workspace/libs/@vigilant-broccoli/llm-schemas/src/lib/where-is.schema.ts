import type { FromSchema } from 'json-schema-to-ts';

export const whereIsAnalyzeSchema = {
  name: 'where_is_analyze',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['description', 'tags'],
    properties: {
      description: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
    },
  },
} as const;

export type WhereIsAnalyzeResult = FromSchema<
  typeof whereIsAnalyzeSchema.schema
>;
