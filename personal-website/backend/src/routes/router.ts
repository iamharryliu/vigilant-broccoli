import express from 'express';

export const router = express.Router();

router.get('/', (_, res) => {
  return res.send('Response for GET endpoint request');
});
