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

export interface Todo {
  id: number;
  title: string;
}
