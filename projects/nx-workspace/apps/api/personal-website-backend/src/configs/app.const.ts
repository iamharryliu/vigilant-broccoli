import { LOCALHOST } from '@vigilant-broccoli/common-js';

export const HOST = process.env.HOST || LOCALHOST;
export const IS_DEV_ENV = HOST === LOCALHOST;
export const PORT = process.env.PORT || 3000;
export const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://harryliu.dev',
  'https://torontoalerts.com',
  'https://cloud8skate.com',
];
export const CORS_OPTIONS = {
  origin: function (origin, callback) {
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
