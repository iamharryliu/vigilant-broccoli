import { createSwaggerSpec } from '@vigilant-broccoli/express';

const SERVICE_TITLE = 'bucket-service';
const SERVICE_DESCRIPTION =
  'Object storage proxy across multiple bucket providers. Requires x-api-key header on /api routes.';

const PROVIDER_QUERY_PARAM = {
  in: 'query',
  name: 'provider',
  required: true,
  schema: { type: 'string' },
  description: 'Bucket provider identifier.',
};

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
    '/api/bucket': {
      get: {
        summary: 'List files',
        parameters: [PROVIDER_QUERY_PARAM],
        responses: {
          '200': { description: 'Array of files' },
          '400': { description: 'provider query parameter is required' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Upload one or more files',
        parameters: [PROVIDER_QUERY_PARAM],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Upload result with file names' },
          '400': { description: 'Missing provider or files' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/bucket/{fileName}': {
      get: {
        summary: 'Download a file',
        parameters: [
          PROVIDER_QUERY_PARAM,
          {
            in: 'path',
            name: 'fileName',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Raw file content',
            content: {
              'application/octet-stream': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Delete a file',
        parameters: [
          PROVIDER_QUERY_PARAM,
          {
            in: 'path',
            name: 'fileName',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'File deleted successfully' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
  },
});
