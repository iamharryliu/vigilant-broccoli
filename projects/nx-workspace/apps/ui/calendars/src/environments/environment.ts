export const ENVIRONMENT = {
  API_URL: import.meta.env.DEV
    ? 'http://localhost:3001'
    : 'https://staging-vb-express.fly.dev',
};
