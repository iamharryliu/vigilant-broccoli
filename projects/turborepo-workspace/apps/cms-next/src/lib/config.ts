// Environment configuration similar to Flask's config.py

export const config = {
  appName: "CMS Next",
  environment: process.env.NODE_ENV || "development",


  // Auth
  authSecret: process.env.BETTER_AUTH_SECRET,
  authUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Google OAuth
  googleClientId: process.env.GOOGLE_AUTH_PROVIDER_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_AUTH_PROVIDER_CLIENT_SECRET,

  // Cloudflare R2
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  cloudflareAccessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  cloudflareSecretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION || "eeur",

  // File storage
  contentDirectory: "content",
  useS3Storage: process.env.NODE_ENV === "production",
} as const;

export type Config = typeof config;
