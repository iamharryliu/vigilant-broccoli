const jsonServer = require('json-server');
const middleware = jsonServer.defaults();
const server = jsonServer.create();

server.use(middleware);
server.use(jsonServer.bodyParser);

const generalData = require('./data/general');

server.get('/test', (req, res, next) => {
  res.status(200).send(generalData.getTest);
});

server.post('/email-alerts', (req, res, next) => {
  const email = req.body.email;
  switch (email) {
    case 'subscribed@e':
      return res.status(200).send({
        success: false,
        message: 'This email is already subscribed.',
      });
    default:
      res.status(201).send({
        success: true,
        message: 'Email alert saved successfully.',
      });
  }
  res.status(200).send({});
});

server.put('/verify-email-subscription/:token', (req, res, next) => {
  const token = req.params.token;
  switch (token) {
    case 'fail':
      return res.status(200).send({ message: 'Email does not exist.' });
    default:
      return res.status(201).send({ message: 'Email has been verified.' });
  }
});

server.post('/send-message', (req, res, next) => {
  res.status(200).send({});
});

server.get('/get-outfit-recommendation', (req, res, next) => {
  res.status(200).send({ data: 'Outfit recommendation' });
});

server.listen(3000, () => {
  console.log('JSON mock server listening on port 3000');
});
