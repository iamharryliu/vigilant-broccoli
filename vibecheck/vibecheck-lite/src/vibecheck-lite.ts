import OpenAI from 'openai';
import { Location } from './vibecheck-lite.model';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export class VibecheckLite {
  static HOURS_OF_PREDICTION_FOR_RECOMMENDATION = 12;

  static getNumberOf3HourBlocks() {
    return this.HOURS_OF_PREDICTION_FOR_RECOMMENDATION / 3;
  }

  static async getOutfitRecommendation(location: Location) {
    try {
      const requestData =
        await VibecheckLite.getWeatherDataForOutfitRecommendation(location);
      const requestString = `Can you recommend complete outfits to wear with the following json data for the ${
        this.getNumberOf3HourBlocks
      } separate times. Please use the "dt_txt" parameter for the time, it is in GMT, please convert it to EST. Please use the "temp" parameter, it is in degrees Kelvin (K), please convert it to degrees Celsius (C).${JSON.stringify(
        requestData,
      )}. Convert the date and time from GMT to EST for the answer. Convert the temperature to celsius instead of Kelvin for the answer. Reply using the following template: \nTime {h:mm EST}:\n- Temperature: {temperature in celsius to nearest integer}\n- Weather: {weather}\n- Recommendation: {recommended outfit}.`;
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: requestString }],
        model: 'gpt-3.5-turbo',
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.log(err);
    }
  }

  static async getWeatherDataForOutfitRecommendation(location: Location) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}`,
      );
      const data = await res.json();
      const requestData = data.list.slice(0, this.getNumberOf3HourBlocks());
      return requestData;
    } catch (err) {
      console.log(err);
    }
  }
}
