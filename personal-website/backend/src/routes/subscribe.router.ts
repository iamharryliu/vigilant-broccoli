import express from 'express';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from '../middlewares/common.middleware';
import { NewsletterService } from '../services/newsletter.service';
import {
  EncryptionService,
  HTTP_STATUS_CODES,
} from '@prettydamntired/node-tools';
import { ResponseError } from '../models/error.model';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

router.post('/email-alerts', requireJsonContent, (req, res) => {
  const email = req.body.email;
  if (!email) {
    const err = new Error('Email is required.') as ResponseError;
    err.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
    throw err;
  }
  NewsletterService.subscribeEmail(email).then(message => {
    return res.status(HTTP_STATUS_CODES.OK).json({
      message: message,
    });
  });
});

// HANDLE BAD REQUEST
router.put('/verify-email-subscription/:encryptedEmail', async (req, res) => {
  const encryptedEmail = req.params.encryptedEmail;
  const email = EncryptionService.decryptData(encryptedEmail);
  if (await NewsletterService.verifyEmail(email)) {
    return res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: 'Email has been verified.' });
  }
  return res
    .status(HTTP_STATUS_CODES.FORBIDDEN)
    .json({ message: 'Email does not exist.' });
});
