export const requestLogger = (request, response, next) => {
  console.log('Request Logged');
  next();
};

export const requireJsonContent = (request, response, next) => {
  if (request.headers['content-type'] !== 'application/json') {
    response.status(400).send('Server requires application/json');
  } else {
    next();
  }
};
