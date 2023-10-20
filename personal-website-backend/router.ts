import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { EmailSubscription, CORS_OPTIONS } from './app.const';
import { requireJsonContent } from './middleware';
import { logger } from './loggers';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

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
      const newEmailAlert = new EmailSubscription({ email });
      await newEmailAlert.save();
      res.status(201).json({ message: 'Email alert saved successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
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
          logger.error(`Send email request has failed.`);
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
