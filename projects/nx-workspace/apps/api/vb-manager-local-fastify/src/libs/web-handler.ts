import { Readable } from 'stream';
import { ReadableStream as NodeReadableStream } from 'stream/web';
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';

type RouteParams = Record<string, string>;

export type WebHandler<P extends RouteParams = RouteParams> = (
  request: Request,
  context: { params: P },
) => Response | Promise<Response>;

const BODYLESS_METHODS = [HTTP_METHOD.GET, 'HEAD'];

const toHeaders = (request: FastifyRequest): Headers => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      headers.append(key, item);
    }
  }
  return headers;
};

const toWebRequest = (request: FastifyRequest): Request =>
  new Request(`${request.protocol}://${request.host}${request.url}`, {
    method: request.method,
    headers: toHeaders(request),
    body: BODYLESS_METHODS.includes(request.method)
      ? undefined
      : (request.body as BodyInit | undefined),
  });

// The handlers were ported from Next.js route handlers and still speak the
// Fetch API, so they keep their exact request parsing (json/formData/text)
// and response bodies, statuses, headers and streams.
export const webHandler =
  <P extends RouteParams>(handler: WebHandler<P>): RouteHandlerMethod =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await handler(toWebRequest(request), {
      params: request.params as P,
    });
    reply.code(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    if (!response.body) return reply.send();
    return reply.send(
      Readable.fromWeb(response.body as NodeReadableStream<Uint8Array>),
    );
  };
