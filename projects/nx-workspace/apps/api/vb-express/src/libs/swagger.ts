import { createSwaggerSpec } from '@vigilant-broccoli/fastify';

const SERVICE_TITLE = 'vb-express';
const SERVICE_DESCRIPTION =
  'Personal API gateway: better-auth sessions, API key admin, Google Tasks, LLM-backed parsing (calendar, tasks, receipts, recipes, storage), messaging, and audio. /api routes require an x-api-key header with the matching service permission.';

const JSON_CONTENT = 'application/json';
const MULTIPART_CONTENT = 'multipart/form-data';

const imagesSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      base64: { type: 'string' },
      mimeType: { type: 'string' },
    },
  },
};

const jsonBody = (schema: unknown, required = true) => ({
  required,
  content: { [JSON_CONTENT]: { schema } },
});

const audioMultipartBody = (extraProperties: Record<string, unknown> = {}) => ({
  required: true,
  content: {
    [MULTIPART_CONTENT]: {
      schema: {
        type: 'object',
        required: ['audio'],
        properties: {
          audio: { type: 'string', format: 'binary' },
          ...extraProperties,
        },
      },
    },
  },
});

const UNAUTHORIZED_RESPONSE = { description: 'Unauthorized' };

export const swaggerSpec = createSwaggerSpec({
  title: SERVICE_TITLE,
  description: SERVICE_DESCRIPTION,
  globalSecurity: true,
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        security: [],
        responses: { '200': { description: 'Service name' } },
      },
    },
    '/api/__ping': {
      get: {
        summary: 'Authenticated ping (any valid API key)',
        responses: {
          '200': { description: '{ ok: true }' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/auth/{path}': {
      get: {
        summary: 'better-auth endpoints (sessions, Google OAuth, API keys)',
        security: [],
        parameters: [
          {
            name: 'path',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'better-auth response' } },
      },
      post: {
        summary: 'better-auth endpoints (sessions, Google OAuth, API keys)',
        security: [],
        parameters: [
          {
            name: 'path',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'better-auth response' } },
      },
    },
    '/contact/send-message': {
      post: {
        summary: 'Contact form (recaptcha-protected, no API key)',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['name', 'email', 'message', 'recaptchaToken'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            message: { type: 'string' },
            appName: { type: 'string' },
            recaptchaToken: { type: 'string' },
          },
        }),
        responses: {
          '200': { description: 'Emails queued' },
          '403': { description: 'Recaptcha rejected' },
          '500': { description: 'Email service failure' },
        },
      },
    },
    '/api/admin/api-keys': {
      get: {
        summary: 'List API keys (admin key required)',
        responses: {
          '200': { description: 'Keys with services, owner email, usage' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
      post: {
        summary: 'Create an API key for a user (admin key required)',
        requestBody: jsonBody({
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
            services: { type: 'array', items: { type: 'string' } },
          },
        }),
        responses: {
          '201': { description: 'Created key (plaintext key returned once)' },
          '400': { description: 'email is required' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/admin/api-keys/{id}': {
      patch: {
        summary: 'Update an API key (admin key required)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            name: { type: 'string' },
            services: { type: 'array', items: { type: 'string' } },
          },
        }),
        responses: {
          '200': { description: 'Updated' },
          '400': { description: 'No valid update fields' },
          '401': UNAUTHORIZED_RESPONSE,
          '404': { description: 'Key not found' },
        },
      },
      delete: {
        summary: 'Delete an API key (admin key required)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Deleted' },
          '401': UNAUTHORIZED_RESPONSE,
          '404': { description: 'Key not found' },
        },
      },
    },
    '/api/messaging/send-text-message': {
      post: {
        summary: 'Send an SMS via Twilio',
        requestBody: jsonBody({
          type: 'object',
          required: ['body', 'from', 'to'],
          properties: {
            body: { type: 'string' },
            from: { type: 'string' },
            to: { type: 'string' },
          },
        }),
        responses: {
          '200': { description: '{ success, sid }' },
          '400': { description: 'Missing body, from, or to' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/tasks/lists': {
      get: {
        summary: 'List Google Task lists (better-auth session cookie)',
        responses: {
          '200': { description: '{ taskLists }' },
          '401': { description: 'No session or Google access token' },
        },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'List tasks (better-auth session cookie)',
        parameters: [
          {
            name: 'taskListId',
            in: 'query',
            schema: { type: 'string', default: '@default' },
          },
        ],
        responses: {
          '200': { description: '{ success, tasks }' },
          '500': { description: 'Not authenticated or Google error' },
        },
      },
      post: {
        summary: 'Create a task (better-auth session cookie)',
        requestBody: jsonBody({
          type: 'object',
          required: ['title'],
          properties: {
            taskListId: { type: 'string', default: '@default' },
            title: { type: 'string' },
            notes: { type: 'string' },
            due: { type: 'string' },
          },
        }),
        responses: {
          '200': { description: '{ success, task }' },
          '500': { description: 'Not authenticated or Google error' },
        },
      },
      patch: {
        summary: 'Update a task (better-auth session cookie)',
        requestBody: jsonBody({
          type: 'object',
          required: ['taskId'],
          properties: {
            taskListId: { type: 'string', default: '@default' },
            taskId: { type: 'string' },
            title: { type: 'string' },
            notes: { type: 'string' },
            due: { type: 'string' },
            status: { type: 'string' },
          },
        }),
        responses: {
          '200': { description: '{ success, task }' },
          '500': { description: 'Not authenticated or Google error' },
        },
      },
      delete: {
        summary: 'Delete a task (better-auth session cookie)',
        parameters: [
          {
            name: 'taskListId',
            in: 'query',
            schema: { type: 'string', default: '@default' },
          },
          {
            name: 'taskId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: '{ success }' },
          '400': { description: 'taskId is required' },
          '500': { description: 'Not authenticated or Google error' },
        },
      },
    },
    '/api/tasks/parse-image': {
      post: {
        summary: 'Extract task items from text and/or images via LLM',
        requestBody: jsonBody({
          type: 'object',
          properties: {
            text: { type: 'string' },
            images: imagesSchema,
            availableLists: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
        }),
        responses: {
          '200': { description: '{ items, suggestedListId }' },
          '400': { description: 'Provide text or at least one image' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/llm': {
      post: {
        summary: 'Proxy an LLM completion request to llm-service',
        requestBody: jsonBody({
          type: 'object',
          required: ['userPrompt', 'model'],
          properties: {
            userPrompt: { type: 'string' },
            systemPrompt: { type: 'string' },
            model: { type: 'string' },
            images: imagesSchema,
            jsonSchema: { type: 'object' },
          },
        }),
        responses: {
          '200': { description: '{ outputs }' },
          '401': UNAUTHORIZED_RESPONSE,
          '502': { description: 'llm-service error' },
        },
      },
    },
    '/api/chat': {
      post: {
        summary: 'Proxy a streamed chat completion to llm-service',
        requestBody: jsonBody({
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
        }),
        responses: {
          '200': {
            description: 'Streamed plain-text response',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/calendar/parse': {
      post: {
        summary: 'Extract calendar events from text and/or images via LLM',
        requestBody: jsonBody({
          type: 'object',
          properties: {
            text: { type: 'string' },
            images: imagesSchema,
            timeZone: { type: 'string', default: 'America/New_York' },
          },
        }),
        responses: {
          '200': { description: '{ events }' },
          '400': { description: 'Provide text or at least one image' },
          '401': UNAUTHORIZED_RESPONSE,
          '422': { description: 'No events found in input' },
        },
      },
    },
    '/api/voice-list': {
      post: {
        summary: 'Transcribe audio and extract list items via LLM',
        requestBody: audioMultipartBody({ context: { type: 'string' } }),
        responses: {
          '200': { description: '{ items }' },
          '400': { description: 'No audio file provided' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/speech-to-text': {
      post: {
        summary: 'Transcribe an audio file',
        requestBody: audioMultipartBody(),
        responses: {
          '200': { description: '{ transcript }' },
          '401': UNAUTHORIZED_RESPONSE,
          '500': { description: 'Transcription failed' },
        },
      },
    },
    '/api/text-to-speech': {
      post: {
        summary: 'Generate speech audio from text',
        requestBody: jsonBody({
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' },
            voiceId: { type: 'string' },
            languageCode: { type: 'string' },
          },
        }),
        responses: {
          '200': {
            description: 'audio/mpeg stream',
            content: {
              'audio/mpeg': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '400': { description: 'Text is required' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/where-is/analyze': {
      post: {
        summary: 'Identify household items in storage-area images via LLM',
        requestBody: jsonBody({
          type: 'object',
          required: ['images'],
          properties: {
            images: imagesSchema,
            existingTags: { type: 'array', items: { type: 'string' } },
          },
        }),
        responses: {
          '200': { description: '{ description, tags }' },
          '400': { description: 'images is required' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/price-tracker/analyze': {
      post: {
        summary: 'Parse receipt images into purchased items via LLM',
        requestBody: jsonBody({
          type: 'object',
          required: ['images'],
          properties: { images: imagesSchema },
        }),
        responses: {
          '200': { description: '{ store, purchasedAt, items }' },
          '400': { description: 'images is required' },
          '401': UNAUTHORIZED_RESPONSE,
        },
      },
    },
    '/api/recipe/scrape': {
      post: {
        summary: 'Extract a recipe as markdown from a URL or image(s) via LLM',
        requestBody: jsonBody({
          type: 'object',
          properties: {
            url: { type: 'string' },
            images: imagesSchema,
            languageCode: { type: 'string' },
          },
        }),
        responses: {
          '200': { description: '{ title, markdown }' },
          '400': { description: 'Provide a url or at least one image' },
          '401': UNAUTHORIZED_RESPONSE,
          '422': { description: 'No recipe could be found' },
          '502': { description: 'Could not reach or read the given URL' },
        },
      },
    },
  },
});
