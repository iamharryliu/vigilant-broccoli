import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
  MEDIA_SERVICE_ENDPOINT,
  MEDIA_SERVICE_FILE_NAME_HEADER,
} from '@vigilant-broccoli/common-js';
import {
  compressForLlm,
  IMAGE_PROFILE,
  ImageProfile,
  MIME_TYPE_JPEG,
  processFile,
  processImage,
} from '../libs/media';

const ERROR_NO_FILE = 'No file provided.';
const DEFAULT_FILE_NAME = 'file';

const readFile = async (req: FastifyRequest) => {
  const part = await req.file();
  if (!part) return null;
  const headerName = req.headers[MEDIA_SERVICE_FILE_NAME_HEADER];
  return {
    buffer: await part.toBuffer(),
    mimeType: part.mimetype,
    name:
      typeof headerName === 'string'
        ? decodeURIComponent(headerName)
        : (part.filename ?? DEFAULT_FILE_NAME),
  };
};

type UploadedFile = NonNullable<Awaited<ReturnType<typeof readFile>>>;

const withFile =
  (handle: (file: UploadedFile, reply: FastifyReply) => unknown) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    const file = await readFile(req);
    if (!file)
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_NO_FILE });
    return handle(file, reply);
  };

const mediaRoutes: FastifyPluginAsync = async app => {
  const registerImageRoutes = (
    imagePath: string,
    llmImagePath: string,
    profile: ImageProfile,
  ) => {
    app.post(
      `/${imagePath}`,
      withFile(async (file, reply) =>
        reply
          .header(CONTENT_TYPE_HEADER, MIME_TYPE_JPEG)
          .send(await processImage(file.buffer, file.mimeType, profile)),
      ),
    );
    app.post(
      `/${llmImagePath}`,
      withFile(async (file, reply) =>
        reply.send(await compressForLlm(file.buffer, profile)),
      ),
    );
  };

  registerImageRoutes(
    MEDIA_SERVICE_ENDPOINT.RECEIPTS_IMAGE,
    MEDIA_SERVICE_ENDPOINT.RECEIPTS_LLM_IMAGE,
    IMAGE_PROFILE.RECEIPTS,
  );
  registerImageRoutes(
    MEDIA_SERVICE_ENDPOINT.WHERE_IS_IMAGE,
    MEDIA_SERVICE_ENDPOINT.WHERE_IS_LLM_IMAGE,
    IMAGE_PROFILE.WHERE_IS,
  );

  app.post(
    `/${MEDIA_SERVICE_ENDPOINT.DOCS_FILE}`,
    withFile(async (file, reply) => {
      const processed = await processFile(
        file.buffer,
        file.mimeType,
        file.name,
      );
      return reply
        .header(CONTENT_TYPE_HEADER, processed.mimeType)
        .header(
          MEDIA_SERVICE_FILE_NAME_HEADER,
          encodeURIComponent(processed.name),
        )
        .send(processed.buffer);
    }),
  );
};

export default mediaRoutes;
