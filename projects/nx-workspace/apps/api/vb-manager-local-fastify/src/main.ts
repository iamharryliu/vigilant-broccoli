import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { buildApp } from './app';

const STATIC_DIR_ENV = 'STATIC_DIR';

const APP_PORT = Number(getEnvironmentVariable('PORT') || 3001);
const APP_HOST = getEnvironmentVariable('HOST') || '127.0.0.1';

const start = async () => {
  const app = await buildApp({
    staticDir: getEnvironmentVariable(STATIC_DIR_ENV) || undefined,
  });
  await app.listen({ port: APP_PORT, host: APP_HOST });
  console.log(`Server running at http://${APP_HOST}:${APP_PORT}`);
};

start();
