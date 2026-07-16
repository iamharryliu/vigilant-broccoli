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
const ERROR_PROVIDER_REQUIRED = 'provider query parameter is required';
const ERROR_NO_FILES = 'No valid files provided';
const MESSAGE_FILE_DELETED = 'File deleted successfully';
const VALID_PROVIDERS = new Set<string>(Object.values(BucketProvider));
const bucketServices = new Map<BucketProvider, IBucketProvider>();

function getBucketService(provider: string) {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  const key = provider as BucketProvider;
  let service = bucketServices.get(key);
  if (!service) {
    service = createBucketService(key);
    bucketServices.set(key, service);
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

const bucketRoutes: FastifyPluginAsync = async app => {
  app.get('/', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const files = await getBucketService(provider).list();
    return reply.send(files);
  });

  app.get('/:fileName', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const { fileName } = req.params as { fileName: string };
    const buffer = await getBucketService(provider).read(fileName);
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
    const bucket = getBucketService(provider);
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

  app.delete('/:fileName', async (req, reply) => {
    const provider = resolveProvider(req, reply);
    if (!provider) return;
    const { fileName } = req.params as { fileName: string };
    await getBucketService(provider).delete(fileName);
    return reply.send({ message: MESSAGE_FILE_DELETED });
  });
};

export default bucketRoutes;
