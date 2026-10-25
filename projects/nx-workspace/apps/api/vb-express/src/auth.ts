import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import pg from 'pg';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  SUPABASE_DB_HOST,
  SUPABASE_DB_NAME,
  SUPABASE_DB_PORT,
  SUPABASE_DB_USER,
} from '@vigilant-broccoli/infrastructure';

const CLIENT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
// Created by supabase/migrations; must match the schema those tables live in.
const AUTH_SCHEMA = 'vb_express_auth';
const MAX_POOL_CONNECTIONS = 3;

const createPool = () => {
  const connectionString = getEnvironmentVariable('DATABASE_URL');
  const pool = new pg.Pool({
    ...(connectionString
      ? { connectionString }
      : {
          host: SUPABASE_DB_HOST,
          port: SUPABASE_DB_PORT,
          user: SUPABASE_DB_USER,
          password: getEnvironmentVariable('SUPABASE_DB_PASSWORD'),
          database: SUPABASE_DB_NAME,
          ssl: { rejectUnauthorized: false },
        }),
    max: MAX_POOL_CONNECTIONS,
  });
  // A SET per connection rather than the `options` startup parameter, which
  // connection poolers are not guaranteed to forward. Caught so a failed SET
  // surfaces as a query error instead of an unhandled rejection crashing boot.
  pool.on('connect', client => {
    client
      .query(`SET search_path TO ${AUTH_SCHEMA}`)
      .catch(error => console.error('vb-express: search_path failed', error));
  });
  return pool;
};

export const auth = betterAuth({
  secret: getEnvironmentVariable('BETTER_AUTH_SECRET'),
  database: createPool(),
  trustedOrigins: CLIENT_ORIGINS,
  // Google refresh tokens grant ongoing Tasks access and otherwise sit in
  // plaintext in the shared database and its nightly pg_dump backups.
  account: {
    encryptOAuthTokens: true,
  },
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

export const buildServicePermissions = (services: string[]) => ({
  [API_KEY_PERMISSION_RESOURCE]: services,
});

export const verifyApiKey = async (key: string) => {
  const { valid } = await auth.api.verifyApiKey({ body: { key } });
  return valid;
};

export const createServiceVerifier =
  (services: string[]) => async (key: string) => {
    const { valid } = await auth.api.verifyApiKey({
      body: { key, permissions: buildServicePermissions(services) },
    });
    return valid;
  };
