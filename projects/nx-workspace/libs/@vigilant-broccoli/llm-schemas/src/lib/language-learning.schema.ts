import type { FromSchema } from 'json-schema-to-ts';

export const languageLearningSchema = {
  name: 'language_learning',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['words', 'exampleSentence'],
    properties: {
      words: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['word', 'type', 'definition'],
          properties: {
            word: { type: 'string' },
            type: { type: 'string', enum: ['common', 'uncommon'] },
            definition: { type: 'string' },
          },
        },
      },
      exampleSentence: {
        type: 'object',
        additionalProperties: false,
        required: ['target', 'english'],
        properties: {
          target: { type: 'string' },
          english: { type: 'string' },
        },
      },
    },
  },
} as const;

export type LanguageLearningResult = FromSchema<
  typeof languageLearningSchema.schema
>;
