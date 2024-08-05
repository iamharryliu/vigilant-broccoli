import express from 'express';
import { ResponseError } from '../models/error.model';
import { requireJsonContent } from '../middlewares/middleware';

export const router = express.Router();

router.use(express.json({ limit: 100 }));

router.get('/', (_, response) => {
  response.send('Response for GET endpoint request');
});

router.get('/route', (_, response) => {
  response.send('Response for GET endpoint requrest');
});

router.get('/post/:value', (request, response) => {
  const value = request.params.value;
  response.send(`Value: ${value} `);
});

router.post('/post', requireJsonContent, (request, response) => {
  const value = request.body.value;
  response.json({ message: `Value ${value}` });
});

router.get('/error', (request, response) => {
  const err = new Error('Processing error') as ResponseError;
  err.statusCode = 400;
  throw err;
});