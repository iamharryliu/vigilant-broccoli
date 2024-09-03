export const PORT = 8080;
export const CORS_OPTIONS = { origin: true, credentials: true };
export const TODO_API_URL = 'https://jsonplaceholder.typicode.com/todos';
export const TODO_HEADERS = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const HTTP_SUCCESS_CODES = {
  OK: 200,
  CREATED: 201,
};

const HTTP_ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_PATH: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const HTTP_STATUS_CODES = {
  ...HTTP_SUCCESS_CODES,
  ...HTTP_ERROR_CODES,
};
