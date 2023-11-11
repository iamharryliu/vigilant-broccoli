import express from 'express';
import cors from 'cors';
import { CORS_OPTIONS, HTTP_STATUS_CODES } from '../configs/app.const';
import { EmailSubscription } from '../models/subscription.model';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from '../middlewares/middleware';
import { logger } from '../middlewares/loggers';
import { EncryptionService } from '../services/EncryptionService';
import { MailTransportService } from '../services/MailTransportService';
import { DEFAULT_EMAIL_REQUEST } from '../models/email.model';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

async function sendVerificationEmail(email: string) {
  const token = EncryptionService.encryptData(email);
  const text = `${process.env.PERSONAL_WEBSITE_FRONTEND_URL}/verify-email-subscription?token=${token}`;
  const subject = 'Please verify email';
  return MailTransportService.sendMail({
    ...DEFAULT_EMAIL_REQUEST,
    to: email,
    subject,
    text,
  });
}

async function verifyEmail(email: string) {
  return EmailSubscription.findOneAndUpdate(
    {
      email: email,
    },
    { email, isVerified: true },
    { new: true },
  );
}

router.put(
  '/verify-email-subscription/:token',
  cors(CORS_OPTIONS),
  async (req, res) => {
    const token = req.params.token;
    try {
      const email = EncryptionService.decryptData(token);
      if (await verifyEmail(email)) {
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
  },
);

async function findEmailSubscription(email: string) {
  return EmailSubscription.findOne({
    email: email,
  });
}

async function isEmailSubscribed(email: string) {
  const emailSubscription = await findEmailSubscription(email);
  const isSubscribed = !!emailSubscription;
  return isSubscribed;
}

async function subscribeEmail(email) {
  const newEmailAlert = new EmailSubscription({ email, isVerified: false });
  return newEmailAlert.save();
}

router.post(
  '/email-alerts',
  cors(CORS_OPTIONS),
  requireJsonContent,
  async (req, res) => {
    try {
      const email = req.body.email;
      if (!email) {
        return res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'Email is required.' });
      }
      if (await isEmailSubscribed(email)) {
        return res.status(HTTP_STATUS_CODES.OK).json({
          success: false,
          message: 'This email is already subscribed.',
        });
      }
      await subscribeEmail(email);
      sendVerificationEmail(email).then(_ => {
        return res.status(HTTP_STATUS_CODES.CREATED).json({
          success: true,
          message: 'Email alert saved successfully.',
        });
      });
    } catch (error) {
      logger.error(error);
      return res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
    }
  },
);

async function sendMessage(body) {
  const { name, email, message } = body;
  const from = `'${name}' <youremail@gmail.com>`;
  const subject = 'Message from personal website.';
  const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
  return MailTransportService.sendMail({
    ...DEFAULT_EMAIL_REQUEST,
    from,
    subject,
    text,
  });
}

router.post(
  '/send-message',
  cors(CORS_OPTIONS),
  requireJsonContent,
  async (req, res) => {
    try {
      sendMessage(req.body).then(_ => {
        return res.status(HTTP_STATUS_CODES.OK).json({ success: true });
      });
    } catch (error) {
      logger.error(error);
      return res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
    }
  },
);

module.exports = { router };
