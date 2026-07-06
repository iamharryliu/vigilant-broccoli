import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { DatabaseSync } from 'node:sqlite';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const CLIENT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const DEFAULT_DATABASE_PATH = 'vb-express.sqlite';

const DATABASE_PATH =
  getEnvironmentVariable('DATABASE_PATH') || DEFAULT_DATABASE_PATH;

export const auth = betterAuth({
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
