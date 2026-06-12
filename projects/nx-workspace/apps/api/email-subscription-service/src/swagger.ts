import { API_KEY_SCHEME, createSwaggerSpec } from '@vigilant-broccoli/express';

const SERVICE_TITLE = 'email-subscription-service';
const SERVICE_DESCRIPTION =
  'Email subscription management and broadcast. Requires x-api-key header on /subscribe, /unsubscribe, and /notify.';

const subscriptionRefSchema = {
  type: 'object',
  required: ['email', 'subscriptionName'],
  properties: {
    email: { type: 'string' },
    subscriptionName: { type: 'string' },
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
    '/subscribe': {
      post: {
        summary: 'Subscribe an email to a named subscription',
        security: apiKeySecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: subscriptionRefSchema } },
        },
        responses: {
          '200': { description: 'Subscribed' },
          '400': { description: 'email and subscriptionName are required' },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Failed to save subscription' },
        },
      },
    },
    '/unsubscribe': {
      post: {
        summary: 'Remove an email from a named subscription',
        security: apiKeySecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: subscriptionRefSchema } },
        },
        responses: {
          '200': { description: 'Unsubscribed' },
          '400': { description: 'email and subscriptionName are required' },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Failed to remove subscription' },
        },
      },
    },
    '/notify': {
      post: {
        summary: 'Queue a broadcast email to all subscribers of a subscription',
        security: apiKeySecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subscriptionName', 'message'],
                properties: {
                  subscriptionName: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Number of emails queued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    queued: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'subscriptionName and message are required' },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Failed to fetch subscribers' },
        },
      },
    },
  },
});
