import { betterAuth } from 'better-auth';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const CLIENT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export const auth = betterAuth({
  trustedOrigins: CLIENT_ORIGINS,
  // baseURL: 'https://vb-express.fly.dev',
  socialProviders: {
    google: {
      clientId: getEnvironmentVariable('GOOGLE_AUTH_PROVIDER_CLIENT_ID') as string,
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
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      partitioned: true,
    },
  },
});
