export const errorLogger = (error, request, response, next) => {
  console.log(`Error: ${error.message}`);
  next(error);
};

export const errorResponder = (error, request, response, next) => {
  response.header('Content-Type', 'application/json');
  response.status(error.statusCode).json({ error: error.message });
};

export const invalidPathHandler = (request, response, next) => {
  response.status(400);
  response.send('invalid path');
};
