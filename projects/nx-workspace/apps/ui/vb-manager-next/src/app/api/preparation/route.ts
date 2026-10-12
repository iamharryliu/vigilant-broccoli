import { NextRequest, NextResponse } from 'next/server';
import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  LLM_MODEL,
  VB_EXPRESS_ENDPOINT,
  WEATHER_CONDITIONS,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  PREPARATION_KEY,
  type LocalWeather,
  type Preparation,
} from '@vigilant-broccoli/react-lib';
import { getVbExpressApiKey } from '../../../lib/vb-express';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INVALID_WEATHER_ERROR = 'A valid weather payload is required';
const PREPARATION_UNAVAILABLE_ERROR = 'Preparation is unavailable';

const SYSTEM_PROMPT = `You help someone prepare for their day from today's weather. Given the current conditions and today's temperatures in Celsius, wind speeds in km/h and precipitation in mm, decide for each item whether it is worth bringing or wearing today: wind-resistant clothing (sustained wind or gusts above roughly 25 km/h, or a cold feels-like temperature), rain-resistant clothing (drizzle, rain or thunderstorm, or meaningful precipitation), snow-resistant clothing (snow or freezing wet weather), and sunglasses (bright daytime sun, such as clear or partly cloudy conditions). Be conservative: set an item to true only when it clearly helps.`;

const PREPARATION_SCHEMA = {
  name: 'weather_preparation',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: Object.values(PREPARATION_KEY),
    properties: Object.fromEntries(
      Object.values(PREPARATION_KEY).map(key => [key, { type: 'boolean' }]),
    ),
  },
} as const;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isWeather = (
  value: Partial<LocalWeather> | null,
): value is LocalWeather =>
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
}: LocalWeather) =>
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

export async function POST(request: NextRequest) {
  const weather = await request.json().catch(() => null);
  if (!isWeather(weather)) {
    return NextResponse.json(
      { error: INVALID_WEATHER_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        [API_KEY_HEADER]: getVbExpressApiKey(),
      },
      body: JSON.stringify({
        userPrompt: toUserPrompt(weather),
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema: PREPARATION_SCHEMA,
      }),
    },
  ).catch(() => null);

  const outputs: Preparation[] | undefined = res?.ok
    ? (await res.json().catch(() => null))?.outputs
    : undefined;
  if (!outputs?.[0]) {
    return NextResponse.json(
      { error: PREPARATION_UNAVAILABLE_ERROR },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }

  const [output] = outputs;
  const body: Preparation = {
    windResistantClothing: output.windResistantClothing === true,
    rainResistantClothing: output.rainResistantClothing === true,
    snowResistantClothing: output.snowResistantClothing === true,
    sunglasses: output.sunglasses === true,
  };
  return NextResponse.json(body);
}
