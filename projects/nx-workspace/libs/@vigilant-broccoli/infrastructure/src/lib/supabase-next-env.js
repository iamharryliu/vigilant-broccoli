// Plain CommonJS so next.config.js files can require it without a TS loader.
// Next.js inlines `env` into client and server bundles at build time; a set
// environment variable still overrides the committed public defaults.
const { url, publishableKey } = require('./supabase-public.json');

module.exports = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || publishableKey,
};
