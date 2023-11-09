import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { EmailSubscription, CORS_OPTIONS } from '../configs/app.const';
import { requireJsonContent } from '../middlewares/middleware';
import { logger } from '../middlewares/loggers';
import { EncryptionService } from '../services/EncryptionService';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

router.get(
  '/verify-email-subscription/:token',
  cors(CORS_OPTIONS),
  async (req, res) => {
    const token = req.params.token;
    try {
      const email = EncryptionService.decryptData(token);
      const emailSubscription = await EmailSubscription.findOneAndUpdate(
        {
          email: email,
        },
        { email, isVerified: true },
        { new: true },
      );
      if (emailSubscription) {
        return res.status(201).json({ message: 'Email has been verified.' });
      }
      return res.status(200).json({ message: 'Email does not exist.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.post(
  '/email-alerts',
  cors(CORS_OPTIONS),
  requireJsonContent,
  async (req, res) => {
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }
      const isSubscribed = !!(await EmailSubscription.findOne({
        email: email,
      }));
      if (isSubscribed) {
        return res
          .status(201)
          .json({ message: 'This email is already subscribed.' });
      }
      const newEmailAlert = new EmailSubscription({ email, isVerified: false });
      await newEmailAlert.save();
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_EMAIL_PASSWORD,
        },
      });
      const token = EncryptionService.encryptData(email);
      await transporter
        .sendMail({
          from: 'harryliu.design <harryliu1995@gmail.com>',
          to: email,
          subject: 'Please verify email',
          text: `/verify-email-subscription/:${token}`,
        })
        .then(_ => {
          return res
            .status(201)
            .json({ message: 'Email alert saved successfully.' });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.post(
  '/send-message',
  cors(CORS_OPTIONS),
  requireJsonContent,
  async (req, res) => {
    const { token, name, email, message } = req.body;
    fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_V3_SECRET_KEY}&response=${token}`,
    })
      .then(response => response.json())
      .then(json => {
        const { score } = json;
        if (score > 0.3) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MY_EMAIL,
              pass: process.env.MY_EMAIL_PASSWORD,
            },
          });
          transporter
            .sendMail({
              from: `'${name}' <youremail@gmail.com>`,
              to: process.env.MY_EMAIL,
              subject: 'Message from personal website.',
              text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            })
            .then(_ => {
              return res.status(200).json({ success: true });
            });
        } else {
          logger.error(`reCAPTCHA score of ${score} is too low.`);
          return res.status(200).json({ success: false });
        }
      })
      .catch(error => {
        logger.error(error);
      });
  },
);

module.exports = { router };
