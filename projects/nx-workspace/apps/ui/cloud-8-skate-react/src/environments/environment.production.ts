export const ENVIRONMENT = {
  PRODUCTION: !import.meta.env.DEV,
  RECAPTCHA_V3_SITE_KEY: '6LfAdbMoAAAAAOR8IRGqw-3gPj8Fdl5GHqm6wzOF',
  ANALYTICS_ID: import.meta.env.DEV ? '' : 'G-SJELMQXML9',
  API_URL: import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://production-vb-express.fly.dev',
};
