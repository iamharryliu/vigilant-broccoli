// Constants similar to Flask's const.py

export const UserType = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  USER: "USER",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export const HttpStatus = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const FlashCategory = {
  DEBUG: "debug",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  DANGER: "danger",
} as const;

export const UserConfig = {
  MAX_USERNAME_LENGTH: 30,
  MAX_EMAIL_LENGTH: 128,
  MAX_PASSWORD_LENGTH: 128,
  TOKEN_EXPIRY_MINUTES: 5,
} as const;
