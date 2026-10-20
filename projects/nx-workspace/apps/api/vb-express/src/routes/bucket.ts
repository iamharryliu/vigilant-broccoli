import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import {
  getUploadUrl,
  getDownloadUrl,
  deleteFile,
  listFiles,
  readFile,
  uploadFiles,
} from '../libs/storage-service.client';

const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const FILE_NAME_PARAM = 'fileName';
const FILES_FIELD = 'files';
const ERROR_FILE_NAME_REQUIRED = 'fileName query parameter is required';
const ERROR_NO_FILES = 'No valid files provided';

const toParams = (req: FastifyRequest) =>
  new URLSearchParams(req.query as Record<string, string>);

const sendError = (reply: FastifyReply, e: unknown) =>
  reply
    .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    .send({ error: (e as Error).message });

const bucketRoutes: FastifyPluginAsync = async app => {
  app.get('/upload-url', async (req, reply) => {
    try {
      return reply.send({ url: await getUploadUrl(toParams(req)) });
    } catch (e) {
      return sendError(reply, e);
    }
  });

  app.get('/download-url', async (req, reply) => {
    try {
      return reply.send({ url: await getDownloadUrl(toParams(req)) });
    } catch (e) {
      return sendError(reply, e);
    }
  });

  app.get('/files', async (req, reply) => {
    try {
      return reply.send(await listFiles(toParams(req)));
    } catch (e) {
      return sendError(reply, e);
    }
  });

  app.post('/files', async (req, reply) => {
    const body = new FormData();
    for await (const part of req.files()) {
      body.append(
        FILES_FIELD,
        new Blob([new Uint8Array(await part.toBuffer())]),
        part.filename,
      );
    }
    if (!body.has(FILES_FIELD)) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_NO_FILES });
    }
    try {
      return reply.send(await uploadFiles(toParams(req), body));
    } catch (e) {
      return sendError(reply, e);
    }
  });

  app.get('/file', async (req, reply) => {
    const params = toParams(req);
    const fileName = params.get(FILE_NAME_PARAM);
    if (!fileName) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_FILE_NAME_REQUIRED });
    }
    params.delete(FILE_NAME_PARAM);
    try {
      const buffer = await readFile(fileName, params);
      return reply
        .header(
          CONTENT_DISPOSITION_HEADER,
          `attachment; filename="${fileName}"`,
        )
        .header(CONTENT_TYPE_HEADER, CONTENT_TYPE_OCTET_STREAM)
        .send(buffer);
    } catch (e) {
      return sendError(reply, e);
    }
  });

  app.delete('/file', async (req, reply) => {
    try {
      await deleteFile(toParams(req));
      return reply.send({ success: true });
    } catch (e) {
      return sendError(reply, e);
    }
  });
};

export default bucketRoutes;
