import express from 'express';
import {
  checkRecaptchaToken,
  requireJsonContent,
} from '../middlewares/common.middleware';
import {
  DEFAULT_EMAIL_REQUEST,
  HTTP_STATUS_CODES,
  MailService,
  logger,
} from '@prettydamntired/node-tools';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));
router.use(checkRecaptchaToken);

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
