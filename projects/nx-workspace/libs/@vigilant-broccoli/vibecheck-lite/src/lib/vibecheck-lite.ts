import {
  formatLocalTime,
  Location,
  LLM_MODEL,
  WEATHER_CONDITION_LABEL,
  WeatherProvider,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { WeatherService } from '@vigilant-broccoli/common-node';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import {
  vibecheckOutfitSchema,
  VibecheckOutfitResult,
} from '@vigilant-broccoli/llm-schemas';

type OutfitRecommendation = VibecheckOutfitResult;

const FORECAST_COUNT = 4;
const SECONDS_PER_HOUR = 3600;

interface ForecastEntry {
  localTime: string;
  temperature: number;
  weather: string;
}

// Helper function to get weather data for outfit recommendation
async function getWeatherDataForOutfitRecommendation(
  location: Location,
  provider?: WeatherProvider,
): Promise<WeatherSnapshot> {
  return WeatherService.getWeather(location, {
    ...(provider ? { provider } : {}),
    hourlyCount: FORECAST_COUNT,
  });
}

// The snapshot is already local-time and Celsius, so the model is handed
// finished values rather than being asked to convert them.
function toForecastEntries(snapshot: WeatherSnapshot): ForecastEntry[] {
  return snapshot.hourly.map(entry => ({
    localTime: formatLocalTime(
      entry.timestampMs,
      snapshot.timezoneOffsetSeconds,
    ),
    temperature: Math.round(entry.temperatureC),
    weather: WEATHER_CONDITION_LABEL[entry.condition],
  }));
}

// Helper function to build prompt structure
function buildPromptStructured(snapshot: WeatherSnapshot): {
  systemPrompt: string;
  userPrompt: string;
} {
  const timezoneOffsetHours = snapshot.timezoneOffsetSeconds / SECONDS_PER_HOUR;
  const timezoneString =
    timezoneOffsetHours >= 0
      ? `UTC+${timezoneOffsetHours}`
      : `UTC${timezoneOffsetHours}`;

  const systemPrompt = `You are a fashion assistant that recommends complete outfits based on weather data.
The user will provide weather forecast data in JSON format for ${FORECAST_COUNT} different times.
Each forecast includes:
- "localTime": local time formatted as "HH:mm"
- "temperature": temperature in Celsius (°C)
- "weather": weather description

Your task is to recommend a complete outfit for each time period.

Return a JSON object with an array of recommendations, each containing:
- localTime: the provided local time, formatted as "HH:mm ${timezoneString}"
- temperature: the provided temperature in Celsius
- weather: the provided weather description
- recommendation: detailed outfit recommendation with specific clothing items`;

  const userPrompt = `Please analyze this weather forecast data and provide outfit recommendations:\n\n${JSON.stringify(
    toForecastEntries(snapshot),
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
  const snapshot = await getWeatherDataForOutfitRecommendation(location);
  const { systemPrompt, userPrompt } = buildPromptStructured(snapshot);
  const result = await LLMService.prompt<OutfitRecommendation>({
    prompt: {
      systemPrompt,
      userPrompt,
    },
    modelConfig: {
      model: LLM_MODEL.GPT_4O_MINI,
    },
    responseFormat: {
      jsonSchema: vibecheckOutfitSchema,
    },
  });

  return formatRecommendation(result.data);
}

// Main function to get outfit recommendation as a stream
async function getOutfitRecommendationStream(
  location: Location,
): Promise<AsyncIterable<string>> {
  const snapshot = await getWeatherDataForOutfitRecommendation(location);
  const { systemPrompt, userPrompt } = buildPromptStructured(snapshot);

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
      jsonSchema: vibecheckOutfitSchema,
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
