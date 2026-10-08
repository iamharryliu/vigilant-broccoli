export const ENVIRONMENT = {
  API_URL: import.meta.env.DEV
    ? 'http://localhost:3001'
    : 'https://production-vb-express.fly.dev',
};
