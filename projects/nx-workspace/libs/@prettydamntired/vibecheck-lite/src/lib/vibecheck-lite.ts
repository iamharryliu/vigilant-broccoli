import 'dotenv-defaults/config';
import { Location, LLM_MODEL } from '@vigilant-broccoli/common-js';
import {
  logger,
  getEnvironmentVariable,
} from '@vigilant-broccoli/common-node';
import { LLMService } from '@vigilant-broccoli/ai-tools';
import OpenAI from 'openai';

export class VibecheckLite {
  private openWeatherApiKey: string;

  constructor(_openAiApiKey = undefined, openWeatherApiKey = undefined) {
    this.openWeatherApiKey = (openWeatherApiKey ||
      getEnvironmentVariable('OPENWEATHER_API_KEY')) as string;
  }

  async getOutfitRecommendation(location: Location): Promise<string> {
    try {
      const { weatherData, timezoneOffset } = await this.getWeatherDataForOutfitRecommendation(
        location,
      );
      const { systemPrompt, userPrompt } = this.buildPrompt(weatherData, timezoneOffset);
      const result = await LLMService.prompt<string>({
        prompt: {
          systemPrompt,
          userPrompt,
        },
        modelConfig: {
          model: LLM_MODEL.GPT_3_5_TURBO,
        },
      });
      return result.data;
    } catch (err) {
      logger.error(err);
      return 'Something went wrong.';
    }
  }

  async getOutfitRecommendationStream(
    location: Location,
  ): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const { weatherData, timezoneOffset } = await this.getWeatherDataForOutfitRecommendation(
      location,
    );
    const { systemPrompt, userPrompt } = this.buildPrompt(weatherData, timezoneOffset);
    return LLMService.promptStream<string>({
      prompt: {
        systemPrompt,
        userPrompt,
      },
      modelConfig: {
        model: LLM_MODEL.GPT_3_5_TURBO,
      },
    });
  }

  private buildPrompt(requestData: any, timezoneOffset: number): { systemPrompt: string; userPrompt: string } {
    const timezoneOffsetHours = timezoneOffset / 3600;
    const timezoneString = timezoneOffsetHours >= 0 ? `UTC+${timezoneOffsetHours}` : `UTC${timezoneOffsetHours}`;

    const systemPrompt = `You are a fashion assistant that recommends complete outfits based on weather data.
The user will provide weather forecast data in JSON format for 4 different times.
Each forecast includes:
- "dt_txt": timestamp in UTC format
- "temp": temperature in Kelvin (K)
- "weather": weather conditions

Your task:
1. Convert timestamps from UTC to local time (timezone offset: ${timezoneOffsetHours} hours from UTC, displayed as ${timezoneString})
2. Convert temperature from Kelvin to Celsius
3. Recommend a complete outfit for each time period

Reply using this exact template for each time:
Time {h:mm ${timezoneString}}:
- Temperature: {temperature in celsius to nearest integer}°C
- Weather: {weather description}
- Recommendation: {recommended complete outfit with specific clothing items}`;

    const userPrompt = `Here is the weather forecast data:\n\n${JSON.stringify(requestData, null, 2)}`;

    return { systemPrompt, userPrompt };
  }

  private async getWeatherDataForOutfitRecommendation(
    location: Location,
  ): Promise<{ weatherData: any; timezoneOffset: number }> {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${this.openWeatherApiKey}`,
      );
      const data = await res.json();
      const weatherData = data.list.slice(0, 4);
      const timezoneOffset = data.city.timezone;
      return { weatherData, timezoneOffset };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}
