import express from 'express';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from '../middlewares/common.middleware';
import { NewsletterService } from '../services/newsletter.service';
import {
  DEFAULT_EMAIL_REQUEST,
  EncryptionService,
  HTTP_STATUS_CODES,
  MailService,
  logger,
} from '@prettydamntired/node-tools';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

router.put('/verify-email-subscription/:encryptedEmail', async (req, res) => {
  const encryptedEmail = req.params.encryptedEmail;
  try {
    const email = EncryptionService.decryptData(encryptedEmail);
    if (await NewsletterService.verifyEmail(email)) {
      return res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: 'Email has been verified.' });
    }
    return res
      .status(HTTP_STATUS_CODES.FORBIDDEN)
      .json({ message: 'Email does not exist.' });
  } catch (error) {
    logger.error(error);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
});

router.post('/email-alerts', requireJsonContent, (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ error: 'Email is required.' });
    }
    NewsletterService.subscribeEmail(email).then(message => {
      return res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message: message,
      });
    });
  } catch (error) {
    logger.error(error);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
});

router.post('/send-message', requireJsonContent, (req, res) => {
  try {
    const { name, email, message } = req.body;
    const from = `'${name}' <youremail@gmail.com>`;
    const subject = 'Message from personal website.';
    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
    MailService.sendEmail({
      ...DEFAULT_EMAIL_REQUEST,
      from,
      subject,
      text,
    });
    return res.status(HTTP_STATUS_CODES.OK).json({ success: true });
  } catch (error) {
    logger.error(error);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
});
