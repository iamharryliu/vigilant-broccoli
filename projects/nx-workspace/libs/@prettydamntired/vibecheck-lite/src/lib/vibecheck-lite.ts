import { Location, LLM_MODEL } from '@vigilant-broccoli/common-js';
import { OpenWeatherService } from '@vigilant-broccoli/common-node';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { z } from 'zod';

// Zod schema for outfit recommendation
const OutfitRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      localTime: z.string().describe('Time in format HH:mm with timezone'),
      temperature: z.number().describe('Temperature in Celsius'),
      weather: z.string().describe('Weather description'),
      recommendation: z
        .string()
        .describe(
          'Complete outfit recommendation with specific clothing items',
        ),
    }),
  ),
});

type OutfitRecommendation = z.infer<typeof OutfitRecommendationSchema>;

// Helper function to get weather data for outfit recommendation
async function getWeatherDataForOutfitRecommendation(
  location: Location,
): Promise<{ weatherData: any; timezoneOffset: number }> {
  return OpenWeatherService.getForecast(location, 4);
}

// Helper function to build prompt structure
function buildPromptStructured(
  requestData: any,
  timezoneOffset: number,
): { systemPrompt: string; userPrompt: string } {
  const timezoneOffsetHours = timezoneOffset / 3600;
  const timezoneString =
    timezoneOffsetHours >= 0
      ? `UTC+${timezoneOffsetHours}`
      : `UTC${timezoneOffsetHours}`;

  const systemPrompt = `You are a fashion assistant that recommends complete outfits based on weather data.
The user will provide weather forecast data in JSON format for 4 different times.
Each forecast includes:
- "dt_txt": timestamp in UTC format
- "temp": temperature in Kelvin (K)
- "weather": weather conditions (array with objects containing description)

Your task:
1. Convert timestamps from UTC to local time (timezone offset: ${timezoneOffsetHours} hours from UTC)
2. Convert temperature from Kelvin to Celsius (round to nearest integer)
3. Recommend a complete outfit for each time period

Return a JSON object with an array of recommendations, each containing:
- localTime: formatted as "HH:mm ${timezoneString}"
- temperature: number in Celsius
- weather: weather description
- recommendation: detailed outfit recommendation with specific clothing items`;

  const userPrompt = `Please analyze this weather forecast data and provide outfit recommendations:\n\n${JSON.stringify(
    requestData,
    null,
    2,
  )}`;

  return { systemPrompt, userPrompt };
}

// Helper function to format recommendation
function formatRecommendation(data: OutfitRecommendation): string {
  return data.recommendations
    .map(rec => {
      return `Time ${rec.localTime}:\n- Temperature: ${rec.temperature}°C\n- Weather: ${rec.weather}\n- Recommendation: ${rec.recommendation}`;
    })
    .join('\n\n');
}

// Helper function to stream formatted text
async function* streamFormattedText(text: string): AsyncIterable<string> {
  // Stream the text in chunks for better UX
  const chunkSize = 10; // characters per chunk
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    // Small delay to simulate streaming effect
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

// Main function to get outfit recommendation
async function getOutfitRecommendation(location: Location): Promise<string> {
  const { weatherData, timezoneOffset } =
    await getWeatherDataForOutfitRecommendation(location);
  const { systemPrompt, userPrompt } = buildPromptStructured(
    weatherData,
    timezoneOffset,
  );
  const result = await LLMService.prompt<OutfitRecommendation>({
    prompt: {
      systemPrompt,
      userPrompt,
    },
    modelConfig: {
      model: LLM_MODEL.GPT_4O_MINI,
    },
    responseFormat: {
      zod: OutfitRecommendationSchema,
    },
  });

  return formatRecommendation(result.data);
}

// Main function to get outfit recommendation as a stream
async function getOutfitRecommendationStream(
  location: Location,
): Promise<AsyncIterable<string>> {
  const { weatherData, timezoneOffset } =
    await getWeatherDataForOutfitRecommendation(location);
  const { systemPrompt, userPrompt } = buildPromptStructured(
    weatherData,
    timezoneOffset,
  );

  // Get structured data first
  const result = await LLMService.prompt<OutfitRecommendation>({
    prompt: {
      systemPrompt,
      userPrompt,
    },
    modelConfig: {
      model: LLM_MODEL.GPT_4O_MINI,
    },
    responseFormat: {
      zod: OutfitRecommendationSchema,
    },
  });

  // Format and stream it
  const formatted = formatRecommendation(result.data);
  return streamFormattedText(formatted);
}

// Const object with all functions
export const VibecheckLite = {
  getOutfitRecommendation,
  getOutfitRecommendationStream,
} as const;
