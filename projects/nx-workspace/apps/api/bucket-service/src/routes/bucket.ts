import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import * as path from 'path';
import {
  createBucketService,
  BucketProvider,
  IBucketProvider,
} from '@vigilant-broccoli/storage';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const PROVIDER_PARAM = 'provider';
const BUCKET_NAME_PARAM = 'bucketName';
const FILE_NAME_PARAM = 'fileName';
const CONTENT_TYPE_PARAM = 'contentType';
const EXPIRES_IN_SECONDS_PARAM = 'expiresInSeconds';
const ERROR_PROVIDER_REQUIRED = 'provider query parameter is required';
const ERROR_FILE_NAME_REQUIRED = 'fileName query parameter is required';
const ERROR_CONTENT_TYPE_REQUIRED = 'contentType query parameter is required';
const ERROR_EXPIRES_IN_SECONDS_REQUIRED =
  'expiresInSeconds query parameter is required';
const ERROR_NO_FILES = 'No valid files provided';
const MESSAGE_FILE_DELETED = 'File deleted successfully';
const STREAM_UPLOAD_BODY_LIMIT_BYTES = 100 * 1024 * 1024;
const VALID_PROVIDERS = new Set<string>(Object.values(BucketProvider));
const bucketServices = new Map<string, IBucketProvider>();

function getBucketService(provider: string, bucketName?: string) {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  const cacheKey = `${provider}:${bucketName ?? ''}`;
  let service = bucketServices.get(cacheKey);
  if (!service) {
    service = createBucketService(
      provider as BucketProvider,
      bucketName ? { bucketName } : undefined,
    );
    bucketServices.set(cacheKey, service);
  }
  return service;
}

function resolveProvider(
  req: FastifyRequest,
  reply: FastifyReply,
): string | null {
  const query = req.query as Record<string, string | undefined>;
  const body = req.body as Record<string, unknown> | undefined;
  const provider = (query[PROVIDER_PARAM] ??
    (body?.[PROVIDER_PARAM] as string | undefined)) as string | undefined;
  if (!provider) {
    reply
      .code(HTTP_STATUS_CODES.BAD_REQUEST)
      .send({ error: ERROR_PROVIDER_REQUIRED });
    return null;
  }
  return provider;
}

function resolveBucketName(req: FastifyRequest): string | undefined {
  const query = req.query as Record<string, string | undefined>;
  const body = req.body as Record<string, unknown> | undefined;
  return (query[BUCKET_NAME_PARAM] ??
    (body?.[BUCKET_NAME_PARAM] as string | undefined)) as string | undefined;
}

function resolveFileName(
  req: FastifyRequest,
  reply: FastifyReply,
): string | null {
  const query = req.query as Record<string, string | undefined>;
  const fileName = query[FILE_NAME_PARAM];
  if (!fileName) {
    reply
      .code(HTTP_STATUS_CODES.BAD_REQUEST)
      .send({ error: ERROR_FILE_NAME_REQUIRED });
    return null;
  }
  return fileName;
}

const bucketRoutes: FastifyPluginAsync = async app => {
  app.get('/', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const files = await getBucketService(
      provider,
      resolveBucketName(req),
    ).list();
    return reply.send(files);
  });

  app.get('/upload-url', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const fileName = resolveFileName(req, reply);
    if (!fileName) return;
    const query = req.query as Record<string, string | undefined>;
    const contentType = query[CONTENT_TYPE_PARAM];
    if (!contentType) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_CONTENT_TYPE_REQUIRED });
    }
    const expiresInSeconds = Number(query[EXPIRES_IN_SECONDS_PARAM]);
    if (!expiresInSeconds) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_EXPIRES_IN_SECONDS_REQUIRED });
    }
    const url = await getBucketService(
      provider,
      resolveBucketName(req),
    ).getUploadUrl(fileName, contentType, expiresInSeconds);
    return reply.send({ url });
  });

  app.get('/download-url', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const fileName = resolveFileName(req, reply);
    if (!fileName) return;
    const query = req.query as Record<string, string | undefined>;
    const expiresInSeconds = Number(query[EXPIRES_IN_SECONDS_PARAM]);
    if (!expiresInSeconds) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_EXPIRES_IN_SECONDS_REQUIRED });
    }
    const url = await getBucketService(
      provider,
      resolveBucketName(req),
    ).getDownloadUrl(fileName, expiresInSeconds);
    return reply.send({ url });
  });

  app.get('/:fileName', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const { fileName } = req.params as { fileName: string };
    const buffer = await getBucketService(
      provider,
      resolveBucketName(req),
    ).read(fileName);
    reply.header(
      CONTENT_DISPOSITION_HEADER,
      `attachment; filename="${fileName}"`,
    );
    reply.header(CONTENT_TYPE_HEADER, CONTENT_TYPE_OCTET_STREAM);
    return reply.send(buffer);
  });

  app.post('/', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const parts = req.files();
    const collected: { filename: string; buffer: Buffer }[] = [];
    for await (const part of parts) {
      collected.push({
        filename: path.basename(part.filename),
        buffer: await part.toBuffer(),
      });
    }
    if (collected.length === 0) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_NO_FILES });
    }
    const bucket = getBucketService(provider, resolveBucketName(req));
    const uploaded = await Promise.all(
      collected.map(async file => {
        await bucket.upload(file.filename, file.buffer);
        return file.filename;
      }),
    );
    return reply.send({
      message: `${uploaded.length} file(s) uploaded successfully`,
      files: uploaded,
    });
  });

  app.post(
    '/stream',
    { bodyLimit: STREAM_UPLOAD_BODY_LIMIT_BYTES },
    async (req, reply) => {
      const provider = resolveProvider(req, reply);
      if (!provider) return;
      const bucket = getBucketService(provider, resolveBucketName(req));
      const parts = req.files({
        throwFileSizeLimit: true,
        limits: { fileSize: STREAM_UPLOAD_BODY_LIMIT_BYTES },
      });
      const uploaded: string[] = [];
      for await (const part of parts) {
        const filename = path.basename(part.filename);
        await bucket.uploadStream(filename, part.file);
        uploaded.push(filename);
      }
      if (uploaded.length === 0) {
        return reply
          .code(HTTP_STATUS_CODES.BAD_REQUEST)
          .send({ error: ERROR_NO_FILES });
      }
      return reply.send({
        message: `${uploaded.length} file(s) uploaded successfully`,
        files: uploaded,
      });
    },
  );

  const deleteFile = async (
    req: FastifyRequest,
    reply: FastifyReply,
    provider: string,
    fileName: string,
  ) => {
    await getBucketService(provider, resolveBucketName(req)).delete(fileName);
    return reply.send({ message: MESSAGE_FILE_DELETED });
  };

  app.delete('/file', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const fileName = resolveFileName(req, reply);
    if (!fileName) return;
    return deleteFile(req, reply, provider, fileName);
  });

  app.delete('/:fileName', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const { fileName } = req.params as { fileName: string };
    return deleteFile(req, reply, provider, fileName);
  });
};

export default bucketRoutes;
