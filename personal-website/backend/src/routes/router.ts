import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import OpenAI from 'openai';

import { EmailSubscription, CORS_OPTIONS } from '../configs/app.const';
import { requireJsonContent } from '../middlewares/middleware';
import { logger } from '../middlewares/loggers';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

router.get('/', cors(CORS_OPTIONS), async (_, res) => {
  res.send('Response for GET endpoint request');
});

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

async function getWeatherDataForOutfitRecommendation(coords) {
  const { LAT, LON } = coords;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${OPENWEATHER_API_KEY}`,
    );
    const data = await res.json();
    const requestData = data.list.slice(0, 4);
    return requestData;
  } catch (err) {
    console.log(err);
  }
}

async function getOutfitRecommendation(coords) {
  let recommendation = '';
  try {
    const requestData = await getWeatherDataForOutfitRecommendation(coords);
    const requestString = `Can you recommend what to wear today with the following json data. Please use the "dt_txt" parameter, it is in GMT, please convert it to EST for display. Please use the "temp" parameter, it is in degrees Kelvin (K), please convert it to degrees Celsius (C).${JSON.stringify(
      requestData,
    )}. Convert the date and time from GMT to EST for the answer. Convert the temperature to celsius instead of Kelvin for the answer.`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: requestString }],
      model: 'gpt-3.5-turbo',
    });
    recommendation = completion.choices[0].message.content;
    return recommendation;
  } catch (err) {
    console.log(err);
  }
}

router.get(
  '/get-outfit-recommendation',
  cors(CORS_OPTIONS),
  async (req, res) => {
    const LAT = req.query.lat;
    const LON = req.query.lon;
    const recommendation = await getOutfitRecommendation({ LAT, LON });
    res.status(200).json({ success: true, data: recommendation });
  },
);

module.exports = { router };
