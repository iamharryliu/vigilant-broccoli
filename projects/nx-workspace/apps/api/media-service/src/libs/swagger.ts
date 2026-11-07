import { createSwaggerSpec } from '@vigilant-broccoli/fastify';
import {
  MEDIA_SERVICE_ENDPOINT,
  MEDIA_SERVICE_FILE_FIELD,
  MEDIA_SERVICE_FILE_NAME_HEADER,
} from '@vigilant-broccoli/common-js';

const SERVICE_TITLE = 'media-service';
const SERVICE_DESCRIPTION =
  'Image and file processing service (resize, re-encode, strip EXIF). Requires x-api-key header on /api routes.';

const uploadBody = (description: string) => ({
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object',
        required: [MEDIA_SERVICE_FILE_FIELD],
        properties: {
          [MEDIA_SERVICE_FILE_FIELD]: {
            type: 'string',
            format: 'binary',
            description,
          },
        },
      },
    },
  },
});

const IMAGE_FILE_DESCRIPTION =
  'JPEG, PNG, WebP, HEIC or HEIF image, up to 10MB';

const jpegResponses = (description: string) => ({
  '200': {
    description,
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
    },
  },
  '400': {
    description:
      'Missing file, unsupported type, oversized file or unreadable image',
  },
  '401': { description: 'Unauthorized' },
  '413': { description: 'File exceeds the 20MB upload limit' },
  '429': { description: 'Rate limit exceeded' },
});

const llmResponses = {
  '200': {
    description: 'Base64 JPEG for LLM input',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            base64: { type: 'string' },
            mimeType: { type: 'string', enum: ['image/jpeg'] },
          },
        },
      },
    },
  },
  '400': { description: 'Missing file' },
  '401': { description: 'Unauthorized' },
  '413': { description: 'File exceeds the 20MB upload limit' },
  '429': { description: 'Rate limit exceeded' },
};

const imageOperations = (
  label: string,
  archive: string,
  llm: string,
  limits: string,
) => ({
  [`/${archive}`]: {
    post: {
      summary: `Process a ${label} image for storage`,
      description: limits,
      requestBody: uploadBody(IMAGE_FILE_DESCRIPTION),
      responses: jpegResponses('Processed JPEG'),
    },
  },
  [`/${llm}`]: {
    post: {
      summary: `Compress a ${label} image for LLM input`,
      requestBody: uploadBody(IMAGE_FILE_DESCRIPTION),
      responses: llmResponses,
    },
  },
});

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
    ...imageOperations(
      'receipt',
      MEDIA_SERVICE_ENDPOINT.RECEIPTS_IMAGE,
      MEDIA_SERVICE_ENDPOINT.RECEIPTS_LLM_IMAGE,
      'Auto-oriented, fit inside 2400px, mozjpeg quality 90. The LLM copy fits inside 1600px at quality 80 and is auto-oriented.',
    ),
    ...imageOperations(
      'where-is',
      MEDIA_SERVICE_ENDPOINT.WHERE_IS_IMAGE,
      MEDIA_SERVICE_ENDPOINT.WHERE_IS_LLM_IMAGE,
      'Auto-oriented, fit inside 1920px, mozjpeg quality 85. The LLM copy fits inside 512px at quality 60 and is not auto-oriented.',
    ),
    [`/${MEDIA_SERVICE_ENDPOINT.DOCS_FILE}`]: {
      post: {
        summary: 'Process a document file for storage',
        description:
          'PDFs pass through unchanged. Images are auto-oriented, fit inside 2560px, re-encoded as mozjpeg quality 85 and renamed to .jpg. Up to 20MB.',
        parameters: [
          {
            name: MEDIA_SERVICE_FILE_NAME_HEADER,
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description:
              'URL-encoded original file name; falls back to the multipart file name',
          },
        ],
        requestBody: uploadBody(
          'PDF, JPEG, PNG, WebP, HEIC or HEIF, up to 20MB',
        ),
        responses: {
          '200': {
            description:
              'Processed file; the final name is in the x-file-name response header (URL-encoded)',
            headers: {
              [MEDIA_SERVICE_FILE_NAME_HEADER]: { schema: { type: 'string' } },
            },
            content: {
              'application/pdf': {
                schema: { type: 'string', format: 'binary' },
              },
              'image/jpeg': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '400': {
            description: 'Missing file, unsupported type or oversized file',
          },
          '401': { description: 'Unauthorized' },
          '413': { description: 'File exceeds the 20MB upload limit' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
  },
});
