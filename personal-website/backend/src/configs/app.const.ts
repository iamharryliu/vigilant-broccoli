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

const HTTP_SUCCESS_CODES = {
  OK: 200,
  CREATED: 201,
};

const HTTP_ERROR_CODES = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  INVALID_PATH: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const HTTP_STATUS_CODES = {
  ...HTTP_SUCCESS_CODES,
  ...HTTP_ERROR_CODES,
};
