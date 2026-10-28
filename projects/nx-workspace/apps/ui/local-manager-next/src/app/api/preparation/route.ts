import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  fetchWeatherPreparation,
  isPreparationWeather,
} from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INVALID_WEATHER_ERROR = 'A valid weather payload is required';
const PREPARATION_UNAVAILABLE_ERROR = 'Preparation is unavailable';

export async function POST(request: NextRequest) {
  const weather = await request.json().catch(() => null);
  if (!isPreparationWeather(weather)) {
    return NextResponse.json(
      { error: INVALID_WEATHER_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const preparation = await fetchWeatherPreparation(weather);
  if (!preparation) {
    return NextResponse.json(
      { error: PREPARATION_UNAVAILABLE_ERROR },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
  return NextResponse.json(preparation);
}
