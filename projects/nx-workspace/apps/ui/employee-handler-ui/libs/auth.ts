import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const auth = betterAuth({
  database: new Database('./sqlite.db'),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: getEnvironmentVariable('AUTH_GOOGLE_CLIENT_ID') as string,
      clientSecret: getEnvironmentVariable('AUTH_GOOGLE_CLIENT_SECRET') as string,
    },
    // github: {
    //     clientId: process.env.GITHUB_CLIENT_ID as string,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
});
