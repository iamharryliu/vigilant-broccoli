import type { FromSchema } from 'json-schema-to-ts';

export const vibecheckOutfitSchema = {
  name: 'vibecheck_outfit',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['recommendations'],
    properties: {
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['localTime', 'temperature', 'weather', 'recommendation'],
          properties: {
            localTime: { type: 'string' },
            temperature: { type: 'number' },
            weather: { type: 'string' },
            recommendation: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

export type VibecheckOutfitResult = FromSchema<
  typeof vibecheckOutfitSchema.schema
>;
