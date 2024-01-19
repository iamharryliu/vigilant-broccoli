import { HTTP_STATUS_CODES } from '@prettydamntired/node-tools';
import express from 'express';

export const router = express.Router();

router.get('/', (_, res) => {
  return res.status(HTTP_STATUS_CODES.OK).send();
});
