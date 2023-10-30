import MailService from '../../mailService/mailService.js';
import OpenAI from 'openai';

const emails = [process.env.MY_EMAIL];

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const mailService = new MailService(
  'gmail',
  process.env.MY_EMAIL,
  process.env.MY_EMAIL_PASSWORD,
);

main();

async function main() {
  for (let email of emails) {
    const subject = `Vibecheck Lite`;
    const message = await getOutfitRecommendation();
    mailService.sendEmail(email, subject, message);
  }
}

async function getOutfitRecommendation() {
  let recommendation = '';
  try {
    const requestData = await getWeatherDataForOutfitRecommendation();
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

async function getWeatherDataForOutfitRecommendation() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=toronto&appid=${OPENWEATHER_API_KEY}`,
    );
    const data = await res.json();
    const requestData = data.list.slice(0, 3);
    return requestData;
  } catch (err) {
    console.log(err);
  }
}
