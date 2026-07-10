import { FastifyPluginAsync, HTTPMethods } from 'fastify';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { auth } from '../auth';

const AUTH_WILDCARD_PATH = '/api/auth/*';
const SET_COOKIE_HEADER = 'set-cookie';
const AUTH_METHODS = [HTTP_METHOD.GET, HTTP_METHOD.POST] as HTTPMethods[];

const authRoutes: FastifyPluginAsync = async app => {
  app.route({
    method: AUTH_METHODS,
    url: AUTH_WILDCARD_PATH,
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value) headers.append(key, value.toString());
      }
      const response = await auth.handler(
        new Request(url, {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        }),
      );
      reply.code(response.status);
      response.headers.forEach((value, key) => {
        if (key !== SET_COOKIE_HEADER) reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header(SET_COOKIE_HEADER, cookies);
      return reply.send(response.body ? await response.text() : null);
    },
  });
};

export default authRoutes;
