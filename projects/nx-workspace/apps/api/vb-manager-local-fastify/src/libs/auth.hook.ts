import { FastifyReply, FastifyRequest } from 'fastify';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { supabase } from './supabase';

export const API_PREFIX = '/api';
const AUTH_EXEMPT_PREFIX = `${API_PREFIX}/auth/`;
const QUERY_SEPARATOR = '?';

const isUnderApi = (path: string) =>
  path === API_PREFIX || path.startsWith(`${API_PREFIX}/`);

export const isApiUrl = (url: string) =>
  isUnderApi(url.split(QUERY_SEPARATOR)[0]);

// Judged on the matched route pattern when there is one, so the exemption
// follows the handler that will actually run rather than the raw URL text.
const requiresAuth = (request: FastifyRequest): boolean => {
  const routeUrl = request.routeOptions.url;
  const path =
    routeUrl && isUnderApi(routeUrl)
      ? routeUrl
      : request.url.split(QUERY_SEPARATOR)[0];
  return isUnderApi(path) && !path.startsWith(AUTH_EXEMPT_PREFIX);
};

const unauthorized = (reply: FastifyReply) =>
  reply.code(HTTP_STATUS_CODES.UNAUTHORIZED).send({ error: 'Unauthorized' });

export const supabaseAuthHook = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (!requiresAuth(request)) return;

  const auth = request.headers[AUTHORIZATION_HEADER.toLowerCase()];
  if (typeof auth !== 'string' || !auth.startsWith(BEARER_PREFIX)) {
    return unauthorized(reply);
  }

  const { data, error } = await supabase.auth.getUser(
    auth.slice(BEARER_PREFIX.length),
  );
  if (error || !data.user) return unauthorized(reply);
};
