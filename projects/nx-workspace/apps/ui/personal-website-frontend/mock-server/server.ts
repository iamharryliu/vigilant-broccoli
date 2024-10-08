/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const jsonServer = require('json-server');
const middleware = jsonServer.defaults();
const server = jsonServer.create();

server.use(middleware);
server.use(jsonServer.bodyParser);

const generalData = require('./data/general');

server.get('/test', (req: any, res: any, next: any) => {
  res.status(200).send(generalData.getTest);
});

server.post('/subscribe/email-alerts', (req: any, res: any, next: any) => {
  const email = req.body.email;
  switch (email) {
    case 'subscribed@e':
      return res.status(200).send({
        message: 'This email is already subscribed.',
      });
    default:
      return res.status(201).send({
        message: 'Email alert saved successfully.',
      });
  }
});

server.put(
  '/subscribe/verify-email-subscription',
  (req: any, res: any, next: any) => {
    const token = req.body.token;
    switch (token) {
      case 'fail':
        return res.status(200).send({ message: 'Email does not exist.' });
      default:
        return res.status(201).send({ message: 'Email has been verified.' });
    }
  },
);

server.post('/contact/send-message', (req: any, res: any, next: any) => {
  res.status(200).send({});
});

server.get(
  '/vibecheck-lite/get-outfit-recommendation',
  (req: any, res: any, next: any) => {
    res.status(200).send({ data: 'Outfit recommendation' });
  },
);

server.listen(3000, () => {
  console.log('JSON mock server listening on port 3000');
});
