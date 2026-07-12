export const ENVIRONMENT = {
  PRODUCTION: !import.meta.env.DEV,
  JOB_HUNT_MODE: false,
  RECAPTCHA_V3_SITE_KEY: '6LcGFJksAAAAAASSxpM5kNEe0NEOPyHhrpMkuBCL',
  ANALYTICS_ID: import.meta.env.DEV ? '' : 'G-GW4BER2BMZ',
  APP_URL: import.meta.env.DEV
    ? 'http://localhost:4200'
    : 'https://harryliu.dev',
  API_URL: import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://production-vb-express.fly.dev',
};
