import express from 'express';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from '../middlewares/common.middleware';
import {
  DEFAULT_EMAIL_REQUEST,
  MailService,
} from '@prettydamntired/test-node-tools';
import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import { IS_DEV_ENV } from '../configs/app.const';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

router.post('/send-message', requireJsonContent, async (req, res) => {
  const { name, email, message } = req.body;
  const from = `'${name}' <youremail@gmail.com>`;
  const subject = 'Message from personal website.';
  const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
  if (!IS_DEV_ENV) {
    await MailService.sendEmail({
      ...DEFAULT_EMAIL_REQUEST,
      from,
      subject,
      text,
    });
  }
  return res.status(HTTP_STATUS_CODES.OK).json({ success: true });
});
