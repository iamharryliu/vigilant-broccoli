import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODEL,
  PREPARATION_KEY,
  VB_EXPRESS_ENDPOINT,
  WEATHER_CONDITIONS,
  WeatherCondition,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '../utils';

export type WeatherPreparation = Record<
  (typeof PREPARATION_KEY)[keyof typeof PREPARATION_KEY],
  boolean
>;

export interface PreparationWeather {
  temperatureC: number;
  feelsLikeC: number;
  highC: number;
  lowC: number;
  windSpeedKph: number;
  windMaxKph: number;
  precipitationMm: number;
  precipitationSumMm: number;
  condition: WeatherCondition;
  isDay: boolean;
}

const PREPARATION_KEYS = Object.values(PREPARATION_KEY);

const SYSTEM_PROMPT = `You help someone prepare for their day from today's weather. Given the current conditions and today's temperatures in Celsius, wind speeds in km/h and precipitation in mm, decide for each item whether it is worth bringing or wearing today: wind-resistant clothing (sustained wind or gusts above roughly 25 km/h, or a cold feels-like temperature), rain-resistant clothing (drizzle, rain or thunderstorm, or meaningful precipitation), snow-resistant clothing (snow or freezing wet weather), and sunglasses (bright daytime sun, such as clear or partly cloudy conditions). Be conservative: set an item to true only when it clearly helps.`;

const PREPARATION_SCHEMA = {
  name: 'weather_preparation',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: PREPARATION_KEYS,
    properties: Object.fromEntries(
      PREPARATION_KEYS.map(key => [key, { type: 'boolean' }]),
    ),
  },
} as const;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const isPreparationWeather = (
  value: Partial<PreparationWeather> | null,
): value is PreparationWeather =>
  !!value &&
  isFiniteNumber(value.temperatureC) &&
  isFiniteNumber(value.feelsLikeC) &&
  isFiniteNumber(value.highC) &&
  isFiniteNumber(value.lowC) &&
  isFiniteNumber(value.windSpeedKph) &&
  isFiniteNumber(value.windMaxKph) &&
  isFiniteNumber(value.precipitationMm) &&
  isFiniteNumber(value.precipitationSumMm) &&
  typeof value.isDay === 'boolean' &&
  WEATHER_CONDITIONS.includes(value.condition as never);

const toUserPrompt = ({
  temperatureC,
  feelsLikeC,
  highC,
  lowC,
  windSpeedKph,
  windMaxKph,
  precipitationMm,
  precipitationSumMm,
  condition,
  isDay,
}: PreparationWeather) =>
  JSON.stringify({
    condition,
    isDay,
    temperatureC,
    feelsLikeC,
    highC,
    lowC,
    windSpeedKph,
    windMaxKph,
    precipitationMm,
    precipitationSumMm,
  });

/** Asks the vb-express LLM route what to bring today; `null` when it is unavailable. */
export const fetchWeatherPreparation = async (
  weather: PreparationWeather,
): Promise<WeatherPreparation | null> => {
  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        [API_KEY_HEADER]: getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: toUserPrompt(weather),
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema: PREPARATION_SCHEMA,
      }),
    },
  ).catch(() => null);

  const outputs: Partial<WeatherPreparation>[] | undefined = res?.ok
    ? (await res.json().catch(() => null))?.outputs
    : undefined;
  const output = outputs?.[0];
  if (!output) return null;

  return Object.fromEntries(
    PREPARATION_KEYS.map(key => [key, output[key] === true]),
  ) as WeatherPreparation;
};
