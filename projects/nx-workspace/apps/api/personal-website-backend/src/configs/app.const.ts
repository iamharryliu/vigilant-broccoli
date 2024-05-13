export const LOCAL_HOST_IP_ADDRESS = '127.0.0.1';
export const HOST = process.env.HOST || LOCAL_HOST_IP_ADDRESS;
export const IS_DEV_ENV = HOST === LOCAL_HOST_IP_ADDRESS;
export const PORT = process.env.PORT || 3000;
export const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://harryliu.design',
  'https://torontoalerts.com',
  'https://cloud8skate.com',
];
export const CORS_OPTIONS = {
  origin: function (origin, callback) {
    // Check if the incoming origin is in the allowed origins list
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
