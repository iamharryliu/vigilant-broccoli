import type { FromSchema } from 'json-schema-to-ts';

export const priceTrackerAnalyzeSchema = {
  name: 'price_tracker_analyze',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['store', 'purchasedAt', 'items'],
    properties: {
      store: { type: ['string', 'null'] },
      purchasedAt: { type: ['string', 'null'] },
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'price', 'quantity', 'unit', 'category'],
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'number' },
            unit: { type: ['string', 'null'] },
            category: { type: ['string', 'null'] },
          },
        },
      },
    },
  },
} as const;

export type PriceTrackerAnalyzeResult = FromSchema<
  typeof priceTrackerAnalyzeSchema.schema
>;
