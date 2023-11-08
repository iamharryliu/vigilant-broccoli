import express from 'express';
import cors from 'cors';
import { CORS_OPTIONS } from '../configs/app.const';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

router.get('/', cors(CORS_OPTIONS), async (_, res) => {
  return res.send('Response for GET endpoint request');
});

module.exports = { router };
