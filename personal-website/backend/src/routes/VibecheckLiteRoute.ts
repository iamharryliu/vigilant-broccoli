import express from 'express';
import cors from 'cors';
import { CORS_OPTIONS } from '../configs/app.const';

export const router = express.Router();
router.use(express.json({ limit: 5000 }));

import OpenAI from 'openai';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
    return res.status(200).json({ success: true, data: recommendation });
  },
);

module.exports = { router };
