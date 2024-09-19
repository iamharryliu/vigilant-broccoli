import { LOCALHOST } from '@prettydamntired/common-lib';

export const HOST = process.env.HOST || LOCALHOST;
export const IS_DEV_ENV = HOST === LOCALHOST;
export const PORT = process.env.PORT || 3000;
export const CORS_OPTIONS = { origin: true, credentials: true };
