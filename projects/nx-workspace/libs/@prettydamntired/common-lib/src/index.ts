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

export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const LOCALHOST = 'localhost';

export const TODO_SITE = {
  EXPRESS: 'https://express-demo.fly.dev/',
  REACT: 'https://react-demo-dcx.pages.dev/',
  VUE: 'https://vue-demo-5gs.pages.dev/',
};
