import express from 'express';
import { Controller } from './controller';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/personal-website-lib';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from '@vigilant-broccoli/express';
import { IS_DEV_ENV } from './configs/app.const';

export const router = express.Router();
router.get('/', (_, res) => res.send('harryliu-design-express'));

router.use(express.json({ limit: 5000 }));
if (!IS_DEV_ENV) {
  router.use(checkRecaptchaToken);
}

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
