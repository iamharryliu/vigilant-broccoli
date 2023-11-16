export const errorLogger = (err, request, response, next) => {
  console.log(`Error: ${err.message}`);
  next(err);
};

export const errorResponder = (err, request, response, next) => {
  response.header('Content-Type', 'application/json');
  response.status(err.statusCode).send(err.message);
};

export const invalidPathHandler = (request, response, next) => {
  response.status(400);
  response.send('invalid path');
};
