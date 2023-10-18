import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { EmailSubscription, CORS_OPTIONS } from './app.const';

export const router = express.Router();
router.use(express.json({ limit: 100 }));

router.post('/email-alerts', cors(CORS_OPTIONS), async (req, res) => {
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
});

router.post('/send-message', cors(CORS_OPTIONS), async (req, res) => {
  const { name, email, message } = req.body;
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
      return res.status(200).json({ message: 'Email sent successfully.' });
    })
    .catch(console.error);
});

module.exports = { router };
