import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const createAuth = () =>
  betterAuth({
    database: new Database('./sqlite.db'),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: getEnvironmentVariable(
          'GOOGLE_AUTH_PROVIDER_CLIENT_ID',
        ) as string,
        clientSecret: getEnvironmentVariable(
          'GOOGLE_AUTH_PROVIDER_CLIENT_SECRET',
        ) as string,
      },
      // github: {
      //     clientId: process.env.GITHUB_CLIENT_ID as string,
      //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      // },
    },
  });

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
}

export const auth = getAuth;
