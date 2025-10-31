import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const NEXT_AUTH_OPTIONS: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnvironmentVariable('NEXTAUTH_GOOGLE_CLIENT_ID') as string,
      clientSecret: getEnvironmentVariable('NEXTAUTH_GOOGLE_CLIENT_SECRET') as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
};

export const NEXT_AUTH_STATUS = {
  LOADING: 'loading',
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED: 'authenticated',
};
