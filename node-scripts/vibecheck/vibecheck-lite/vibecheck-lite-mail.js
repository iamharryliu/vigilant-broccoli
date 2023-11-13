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

class VibecheckLite {
  static async getOutfitRecommendation() {
    let result = '';
    try {
      const requestData =
        await VibecheckLite.getWeatherDataForOutfitRecommendation();
      const requestString = `Can you recommend what to wear today with the following json data. Please use the "dt_txt" parameter, it is in GMT, please convert it to EST for display. Please use the "temp" parameter, it is in degrees Kelvin (K), please convert it to degrees Celsius (C).${JSON.stringify(
        requestData,
      )}. Convert the date and time from GMT to EST for the answer. Convert the temperature to celsius instead of Kelvin for the answer. Reply using the following template: \Date {h:mm EST}:\n- Temperature: {temperature in celsius}\n- Weather: {weather}\n- Recommendation: {recommended outfit}.`;
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: requestString }],
        model: 'gpt-3.5-turbo',
      });
      result =
        completion.choices[0].message.content +
        `\n\n ${JSON.stringify(requestData, null, 2)}`;
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  static async getWeatherDataForOutfitRecommendation() {
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
}

main();

async function main() {
  for (let email of emails) {
    const subject = `Vibecheck Lite`;
    const message = await VibecheckLite.getOutfitRecommendation();
    mailService.sendEmail(email, subject, message);
  }
}
