import { EMAIL_SERVICE_ENDPOINT } from '@vigilant-broccoli/common-node';
import { API_KEY_SCHEME, createSwaggerSpec } from '@vigilant-broccoli/express';

const SERVICE_TITLE = 'email-service';
const SERVICE_DESCRIPTION =
  'Email queue producer/consumer. Requires x-api-key header on send/queue endpoints.';

const emailSchema = {
  type: 'object',
  required: ['to', 'subject'],
  properties: {
    from: { type: 'string' },
    to: { type: 'string' },
    subject: { type: 'string' },
    html: { type: 'string' },
    text: { type: 'string' },
  },
};

const apiKeySecurity = [{ [API_KEY_SCHEME]: [] }];

export const swaggerSpec = createSwaggerSpec({
  title: SERVICE_TITLE,
  description: SERVICE_DESCRIPTION,
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'Status ok and docs link' } },
      },
    },
    [`/${EMAIL_SERVICE_ENDPOINT.SEND_EMAIL}`]: {
      post: {
        summary: 'Queue a single email for delivery',
        security: apiKeySecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: emailSchema } },
        },
        responses: {
          '200': { description: 'Queued' },
          '400': { description: 'to and subject are required' },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Failed to queue email' },
        },
      },
    },
    [`/${EMAIL_SERVICE_ENDPOINT.QUEUE_EMAILS}`]: {
      post: {
        summary: 'Queue a batch of emails',
        security: apiKeySecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'array', items: emailSchema },
            },
          },
        },
        responses: {
          '200': { description: 'Queued' },
          '400': { description: 'emails array is required' },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Failed to queue emails' },
        },
      },
    },
  },
});
