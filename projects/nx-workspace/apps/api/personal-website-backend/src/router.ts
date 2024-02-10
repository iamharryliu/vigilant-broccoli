import express from 'express';
import { Controller } from './controller';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from './middlewares/common.middleware';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/personal-website-lib';
import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

// Index
router.get('/', (_, res) =>
  res.status(HTTP_STATUS_CODES.OK).send('harryliu-design-express'),
);
// Email Subscription
router.post(
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE,
  requireJsonContent,
  Controller.subscribeEmail,
);
router.put(
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION,
  Controller.verifySubscription,
);

// Send Message
router.post(
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE,
  requireJsonContent,
  Controller.sendMessage,
);
