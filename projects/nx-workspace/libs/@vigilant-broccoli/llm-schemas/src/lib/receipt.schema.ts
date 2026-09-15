import type { FromSchema } from 'json-schema-to-ts';

export const receiptAnalyzeSchema = {
  name: 'receipt_analyze',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'merchantName',
      'merchantAddress',
      'purchasedAt',
      'currency',
      'taxInclusive',
      'taxes',
      'total',
      'items',
    ],
    properties: {
      merchantName: { type: ['string', 'null'] },
      merchantAddress: { type: ['string', 'null'] },
      purchasedAt: { type: ['string', 'null'] },
      currency: { type: ['string', 'null'] },
      taxInclusive: { type: 'boolean' },
      total: { type: ['number', 'null'] },
      taxes: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['rate', 'taxAmount', 'netAmount', 'grossAmount'],
          properties: {
            rate: { type: 'number' },
            taxAmount: { type: ['number', 'null'] },
            netAmount: { type: ['number', 'null'] },
            grossAmount: { type: ['number', 'null'] },
          },
        },
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'name',
            'normalizedName',
            'quantity',
            'unit',
            'unitPrice',
            'totalPrice',
            'category',
          ],
          properties: {
            name: { type: 'string' },
            normalizedName: { type: ['string', 'null'] },
            quantity: { type: 'number' },
            unit: { type: ['string', 'null'] },
            unitPrice: { type: ['number', 'null'] },
            totalPrice: { type: 'number' },
            category: { type: ['string', 'null'] },
          },
        },
      },
    },
  },
} as const;

export type ReceiptAnalyzeResult = FromSchema<
  typeof receiptAnalyzeSchema.schema
>;
