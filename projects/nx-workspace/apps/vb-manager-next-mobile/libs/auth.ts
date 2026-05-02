import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';

const db = new Database('./sqlite.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id)
  );
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id),
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER,
    updatedAt INTEGER
  );
`);

const ALLOWED_EMAIL = 'harryliu1995@gmail.com';

export const auth = betterAuth({
  database: db,
  databaseHooks: {
    user: {
      create: {
        before: async user => {
          if (user.email !== ALLOWED_EMAIL) {
            throw new Error('Unauthorized');
          }
          return { data: user };
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_AUTH_PROVIDER_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_PROVIDER_CLIENT_SECRET as string,
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
      ],
      accessType: 'offline',
      prompt: 'consent',
    },
  },
});
