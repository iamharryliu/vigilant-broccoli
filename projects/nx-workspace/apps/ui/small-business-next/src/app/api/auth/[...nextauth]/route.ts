import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const NEXT_AUTH_OPTIONS: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnvironmentVariable('NEXTAUTH_GOOGLE_CLIENT_ID'),
      clientSecret: getEnvironmentVariable('NEXTAUTH_GOOGLE_CLIENT_SECRET'),
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

const handler = NextAuth(NEXT_AUTH_OPTIONS);

export { handler as GET, handler as POST };
