export const LOCAL_HOST_IP_ADDRESS = '127.0.0.1';
export const HOST = process.env.HOST || LOCAL_HOST_IP_ADDRESS;
export const IS_DEV_ENV = HOST === LOCAL_HOST_IP_ADDRESS;
export const PORT = process.env.PORT || 3000;
export const ALLOWED_ORIGINS = [
  'https://harryliu.design',
  'https://torontoalerts.com',
  'https://cloud8skate.com',
  'https://cloud8skate.com/',
];
export const CORS_OPTIONS = {
  origin: ALLOWED_ORIGINS,
  credentials: true,
};
