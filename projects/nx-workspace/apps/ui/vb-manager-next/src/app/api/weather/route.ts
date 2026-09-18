import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_STATUS_CODES,
  isWeatherProvider,
  WeatherProvider,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { WeatherService } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_DURATION_MS = 10 * 60 * 1000;
const HOURLY_COUNT = 8;
const DAILY_COUNT = 5;

const LAT_PARAM = 'lat';
const LON_PARAM = 'lon';
const PROVIDER_PARAM = 'provider';

const weatherCache = new Map<
  string,
  { snapshot: WeatherSnapshot; timestamp: number }
>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get(LAT_PARAM));
  const lon = Number(searchParams.get(LON_PARAM));

  if (!lat || !lon) {
    return NextResponse.json(
      { success: false, error: 'Missing lat or lon parameters' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const requestedProvider = searchParams.get(PROVIDER_PARAM);

  if (requestedProvider && !isWeatherProvider(requestedProvider)) {
    return NextResponse.json(
      {
        success: false,
        error: `Unknown weather provider ${requestedProvider}`,
      },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const provider = requestedProvider as WeatherProvider | null;
  const cacheKey = `${lat},${lon},${provider ?? ''}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ success: true, weather: cached.snapshot });
  }

  try {
    const snapshot = await WeatherService.getWeather(
      { latitude: lat, longitude: lon },
      {
        ...(provider ? { provider } : {}),
        hourlyCount: HOURLY_COUNT,
        dailyCount: DAILY_COUNT,
      },
    );

    weatherCache.set(cacheKey, { snapshot, timestamp: Date.now() });

    return NextResponse.json({ success: true, weather: snapshot });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather data',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
