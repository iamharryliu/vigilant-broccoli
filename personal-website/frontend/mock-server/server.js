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
  res.status(200).send({});
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
