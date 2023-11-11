import crypto from 'crypto';
export const LOCAL_HOST_IP_ADDRESS = '127.0.0.1';
export const HOST = process.env.HOST || LOCAL_HOST_IP_ADDRESS;
export const IS_DEV_ENV = HOST === LOCAL_HOST_IP_ADDRESS;
export const PORT = process.env.PORT || 3000;
export const CORS_OPTIONS = { origin: true, credentials: true };
export const ENCRYPTION_SECRET_KEY = crypto
  .createHash('sha512')
  .update(process.env.SECRET_KEY)
  .digest('hex')
  .substring(0, 32);
export const ENCRYPTION_SECRET_IV = crypto
  .createHash('sha512')
  .update(process.env.SECRET_IV)
  .digest('hex')
  .substring(0, 16);
