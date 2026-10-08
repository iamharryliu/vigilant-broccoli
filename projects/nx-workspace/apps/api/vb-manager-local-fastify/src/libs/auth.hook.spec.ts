import { FastifyInstance } from 'fastify';
import { buildApp } from '../app';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({
  supabase: { auth: { getUser: jest.fn() } },
}));

jest.mock('@vigilant-broccoli/devops-cli', () => ({
  ...jest.requireActual('@vigilant-broccoli/devops-cli'),
  Pm2Service: { listProcesses: jest.fn().mockResolvedValue([]) },
}));

const getUser = supabase.auth.getUser as jest.Mock;
const VALID_TOKEN = 'valid-token';
const AUTH_HEADER = { authorization: `Bearer ${VALID_TOKEN}` };

const PROTECTED_ROUTES = [
  { method: 'POST', url: '/api/shell/execute' },
  { method: 'GET', url: '/api/docker/containers' },
  { method: 'POST', url: '/api/docker/remove' },
  { method: 'GET', url: '/api/pm2/processes' },
  { method: 'POST', url: '/api/pm2/delete' },
  { method: 'GET', url: '/api/ssh-key' },
  { method: 'GET', url: '/api/does-not-exist' },
] as const;

describe('supabaseAuthHook', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    getUser.mockReset();
    getUser.mockImplementation(async (token: string) =>
      token === VALID_TOKEN
        ? { data: { user: { email: 'user@example.com' } }, error: null }
        : { data: { user: null }, error: new Error('invalid token') },
    );
  });

  it.each(PROTECTED_ROUTES)(
    'rejects $method $url without a bearer token',
    async ({ method, url }) => {
      const response = await app.inject({ method, url });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: 'Unauthorized' });
      expect(getUser).not.toHaveBeenCalled();
    },
  );

  it.each(PROTECTED_ROUTES)(
    'rejects $method $url with a token Supabase does not accept',
    async ({ method, url }) => {
      const response = await app.inject({
        method,
        url,
        headers: { authorization: 'Bearer forged' },
      });
      expect(response.statusCode).toBe(401);
    },
  );

  it('rejects a non-bearer Authorization header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/pm2/processes',
      headers: { authorization: VALID_TOKEN },
    });
    expect(response.statusCode).toBe(401);
  });

  it('lets a valid token through to the route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/pm2/processes',
      headers: AUTH_HEADER,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it('exempts /api/auth/* from the hook', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/google-token',
      headers: { ...AUTH_HEADER, 'content-type': 'application/json' },
      payload: {},
    });
    expect(response.statusCode).toBe(400);
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it('does not exempt a route that only shares the /api/auth prefix text', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/authx',
    });
    expect(response.statusCode).toBe(401);
  });
});
