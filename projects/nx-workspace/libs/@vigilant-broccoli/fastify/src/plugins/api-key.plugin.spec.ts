import Fastify from 'fastify';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { createApiKeyPlugin } from './api-key.plugin';

const buildApp = (apiKey?: string) => {
  const app = Fastify();
  app.register(createApiKeyPlugin(apiKey));
  app.get('/protected', async () => ({ ok: true }));
  return app;
};

describe('createApiKeyPlugin', () => {
  it('rejects requests with 500 when the api key is unset', async () => {
    const app = buildApp(undefined);

    const response = await app.inject({ method: 'GET', url: '/protected' });

    expect(response.statusCode).toBe(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    expect(response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('rejects requests with 500 when the api key is an empty string', async () => {
    const app = buildApp('');

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { [API_KEY_HEADER]: 'anything' },
    });

    expect(response.statusCode).toBe(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  });

  it('rejects requests missing the api key header when configured', async () => {
    const app = buildApp('secret');

    const response = await app.inject({ method: 'GET', url: '/protected' });

    expect(response.statusCode).toBe(HTTP_STATUS_CODES.UNAUTHORIZED);
  });

  it('rejects requests with an incorrect api key', async () => {
    const app = buildApp('secret');

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { [API_KEY_HEADER]: 'wrong' },
    });

    expect(response.statusCode).toBe(HTTP_STATUS_CODES.UNAUTHORIZED);
  });

  it('allows requests with the correct api key', async () => {
    const app = buildApp('secret');

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { [API_KEY_HEADER]: 'secret' },
    });

    expect(response.statusCode).toBe(HTTP_STATUS_CODES.OK);
  });
});
