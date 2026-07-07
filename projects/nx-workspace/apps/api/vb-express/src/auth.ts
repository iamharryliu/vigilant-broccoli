import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const CLIENT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const DEFAULT_DATABASE_PATH = 'vb-express.sqlite';
const AUTH_SECRET_FILENAME = 'better-auth.secret';
const AUTH_SECRET_BYTES = 32;

const DATABASE_PATH =
  getEnvironmentVariable('DATABASE_PATH') || DEFAULT_DATABASE_PATH;

const getAuthSecret = () => {
  const envSecret = getEnvironmentVariable('BETTER_AUTH_SECRET');
  if (envSecret) return envSecret;
  const secretPath = join(dirname(DATABASE_PATH), AUTH_SECRET_FILENAME);
  if (!existsSync(secretPath)) {
    writeFileSync(secretPath, randomBytes(AUTH_SECRET_BYTES).toString('hex'), {
      mode: 0o600,
    });
  }
  return readFileSync(secretPath, 'utf8');
};

export const auth = betterAuth({
  secret: getAuthSecret(),
  database: new DatabaseSync(DATABASE_PATH),
  trustedOrigins: CLIENT_ORIGINS,
  socialProviders: {
    google: {
      clientId: getEnvironmentVariable(
        'GOOGLE_AUTH_PROVIDER_CLIENT_ID',
      ) as string,
      clientSecret: getEnvironmentVariable(
        'GOOGLE_AUTH_PROVIDER_CLIENT_SECRET',
      ) as string,
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/tasks',
      ],
      accessType: 'offline',
      prompt: 'consent',
    },
  },
  plugins: [
    apiKey({
      rateLimit: {
        enabled: false,
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      partitioned: true,
    },
  },
});

export const API_KEY_PERMISSION_RESOURCE = 'services';
export const API_KEY_MODEL = 'apikey';

export const verifyApiKey = async (key: string) => {
  const { valid } = await auth.api.verifyApiKey({ body: { key } });
  return valid;
};

export const createServiceVerifier =
  (services: string[]) => async (key: string) => {
    const { valid } = await auth.api.verifyApiKey({
      body: { key, permissions: { [API_KEY_PERMISSION_RESOURCE]: services } },
    });
    return valid;
  };
