import { createSwaggerSpec } from '@vigilant-broccoli/fastify';

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

const BUCKET_NAME_QUERY_PARAM = {
  in: 'query',
  name: 'bucketName',
  required: false,
  schema: { type: 'string' },
  description: "Bucket to use, overriding the provider's default bucket.",
};

const FILE_NAME_QUERY_PARAM = {
  in: 'query',
  name: 'fileName',
  required: true,
  schema: { type: 'string' },
  description: 'Object key, may contain slashes.',
};

const EXPIRES_IN_SECONDS_QUERY_PARAM = {
  in: 'query',
  name: 'expiresInSeconds',
  required: true,
  schema: { type: 'integer' },
  description: 'Presigned URL time-to-live.',
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
        parameters: [PROVIDER_QUERY_PARAM, BUCKET_NAME_QUERY_PARAM],
        responses: {
          '200': { description: 'Array of files' },
          '400': { description: 'provider query parameter is required' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Upload one or more files',
        parameters: [PROVIDER_QUERY_PARAM, BUCKET_NAME_QUERY_PARAM],
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
    '/api/bucket/upload-url': {
      get: {
        summary:
          'Get a presigned URL for uploading a file directly to the provider',
        parameters: [
          PROVIDER_QUERY_PARAM,
          BUCKET_NAME_QUERY_PARAM,
          FILE_NAME_QUERY_PARAM,
          {
            in: 'query',
            name: 'contentType',
            required: true,
            schema: { type: 'string' },
          },
          EXPIRES_IN_SECONDS_QUERY_PARAM,
        ],
        responses: {
          '200': { description: 'Presigned upload URL' },
          '400': {
            description:
              'Missing provider, fileName, contentType, or expiresInSeconds',
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/bucket/download-url': {
      get: {
        summary:
          'Get a presigned URL for downloading a file directly from the provider',
        parameters: [
          PROVIDER_QUERY_PARAM,
          BUCKET_NAME_QUERY_PARAM,
          FILE_NAME_QUERY_PARAM,
          EXPIRES_IN_SECONDS_QUERY_PARAM,
        ],
        responses: {
          '200': { description: 'Presigned download URL' },
          '400': {
            description: 'Missing provider, fileName, or expiresInSeconds',
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/bucket/file': {
      delete: {
        summary:
          'Delete a file by fileName query parameter (supports keys with slashes)',
        parameters: [
          PROVIDER_QUERY_PARAM,
          BUCKET_NAME_QUERY_PARAM,
          FILE_NAME_QUERY_PARAM,
        ],
        responses: {
          '200': { description: 'File deleted successfully' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/bucket/stream': {
      post: {
        summary:
          'Upload one or more files by streaming each part to the provider',
        parameters: [PROVIDER_QUERY_PARAM, BUCKET_NAME_QUERY_PARAM],
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
        summary:
          'Download a file (single path segment; use /api/bucket/file?fileName= for keys containing slashes)',
        parameters: [
          PROVIDER_QUERY_PARAM,
          BUCKET_NAME_QUERY_PARAM,
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
        summary:
          'Delete a file (single path segment; use DELETE /api/bucket/file?fileName= for keys containing slashes)',
        parameters: [
          PROVIDER_QUERY_PARAM,
          BUCKET_NAME_QUERY_PARAM,
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
