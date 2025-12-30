import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // No database - uses JWT/cookie-based sessions only
  // User data will be hydrated from database after authentication
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_AUTH_PROVIDER_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_AUTH_PROVIDER_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (session is extended if used within this period)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    // Use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
