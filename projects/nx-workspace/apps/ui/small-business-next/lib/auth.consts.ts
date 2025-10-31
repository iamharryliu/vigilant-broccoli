import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const NEXT_AUTH_OPTIONS: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXTAUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_GOOGLE_CLIENT_SECRET as string,
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
