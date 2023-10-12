import express from 'express';
import cors from 'cors';
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

module.exports = { router };
