import { createSwaggerSpec } from '@vigilant-broccoli/fastify';

const SERVICE_TITLE = 'llm-service';
const SERVICE_DESCRIPTION =
  'LLM prompting and chat streaming service. Requires x-api-key header on /api routes.';

export const swaggerSpec = createSwaggerSpec({
  title: SERVICE_TITLE,
  description: SERVICE_DESCRIPTION,
  globalSecurity: true,
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        security: [],
        responses: { '200': { description: 'Service name and docs link' } },
      },
    },
    '/api/llm': {
      post: {
        summary: 'Generate LLM completion(s)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userPrompt', 'model'],
                properties: {
                  userPrompt: { type: 'string' },
                  systemPrompt: { type: 'string' },
                  model: { type: 'string' },
                  images: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        base64: { type: 'string' },
                        mimeType: { type: 'string' },
                      },
                    },
                  },
                  numOutputs: { type: 'integer', default: 1, maximum: 4 },
                  responseFormat: { type: 'string', enum: ['json'] },
                  jsonSchema: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Outputs array',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { outputs: { type: 'array', items: {} } },
                },
              },
            },
          },
          '400': { description: 'Missing required fields' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/chat': {
      post: {
        summary: 'Stream chat completion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages'],
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: {
                          type: 'string',
                          enum: ['user', 'assistant', 'system'],
                        },
                        content: { type: 'string' },
                      },
                    },
                  },
                  systemPrompt: { type: 'string' },
                  model: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Streamed plain-text response',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
          '400': { description: 'Missing messages' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
  },
});
