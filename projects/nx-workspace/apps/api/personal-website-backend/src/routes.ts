import express from 'express';
import { Controller } from './controller';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from './middlewares/common.middleware';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/personal-website-lib';

export const router = express.Router();
router.get('/', (_, res) => res.send('harryliu-design-express'));

router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

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
