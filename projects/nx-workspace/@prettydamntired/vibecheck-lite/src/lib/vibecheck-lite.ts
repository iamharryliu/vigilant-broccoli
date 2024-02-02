import 'dotenv-defaults/config';
import { Location } from '@prettydamntired/test-lib';
import OpenAI from 'openai';
import { logger } from '@prettydamntired/test-node-tools';

export class VibecheckLite {
  private openai: OpenAI;
  private openWeatherApiKey: string;

  constructor(openAiApiKey = undefined, openWeatherApiKey = undefined) {
    this.openWeatherApiKey = (openWeatherApiKey ||
      process.env.OPENWEATHER_API_KEY) as string;
    this.openai = new OpenAI({
      apiKey: openAiApiKey || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  async getOutfitRecommendation(location: Location): Promise<string> {
    try {
      const requestData = await this.getWeatherDataForOutfitRecommendation(
        location,
      );
      const requestString = `Can you recommend complete outfits to wear with the following json data for the 4 separate times. Please use the "dt_txt" parameter for the time, it is in GMT, please convert it to EST. Please use the "temp" parameter, it is in degrees Kelvin (K), please convert it to degrees Celsius (C).${JSON.stringify(
        requestData,
      )}. Convert the date and time from GMT to EST for the answer. Convert the temperature to celsius instead of Kelvin for the answer. Reply using the following template: \nTime {h:mm EST}:\n- Temperature: {temperature in celsius to nearest integer}\n- Weather: {weather}\n- Recommendation: {recommended outfit}.`;
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: requestString }],
        model: 'gpt-3.5-turbo',
      });
      const res = completion.choices[0].message.content as string;
      return res;
    } catch (err) {
      logger.error(err);
      return 'Something went wrong.';
    }
  }

  private async getWeatherDataForOutfitRecommendation(
    location: Location,
  ): Promise<any> {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${this.openWeatherApiKey}`,
      );
      const data = await res.json();
      const requestData = data.list.slice(0, 4);
      return requestData;
    } catch (err) {
      logger.error(err);
    }
  }
}
