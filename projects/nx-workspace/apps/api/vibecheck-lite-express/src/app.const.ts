import { LOCALHOST } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const HOST = getEnvironmentVariable('HOST') || LOCALHOST;
export const IS_DEV_ENV = HOST === LOCALHOST;
export const PORT = getEnvironmentVariable('PORT') || 3000;
export const CORS_OPTIONS = { origin: true, credentials: true };
