import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { OpenWeatherService } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_DURATION_MS = 10 * 60 * 1000;

interface CurrentWeatherResponse {
  main: {
    temp: number;
  };
  weather: Array<{
    icon: string;
  }>;
  timezone: number;
}

interface WeatherResponsePayload {
  current: CurrentWeatherResponse;
  forecast: unknown;
}

const weatherCache = new Map<
  string,
  { payload: WeatherResponsePayload; timestamp: number }
>();

// GET - Fetch weather data for a location
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));

  if (!lat || !lon) {
    return NextResponse.json(
      { success: false, error: 'Missing lat or lon parameters' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const cacheKey = `${lat},${lon}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ success: true, ...cached.payload });
  }

  try {
    const location = { latitude: lat, longitude: lon };

    // Fetch both current weather and forecast in parallel with metric units
    const [current, forecast] = await Promise.all([
      OpenWeatherService.getCurrentWeather(
        location,
        'metric',
      ) as Promise<CurrentWeatherResponse>,
      OpenWeatherService.getForecast(location, 40, 'metric'), // Get more forecast data for processing
    ]);

    const payload: WeatherResponsePayload = {
      current,
      forecast: forecast.weatherData,
    };
    weatherCache.set(cacheKey, { payload, timestamp: Date.now() });

    return NextResponse.json({ success: true, ...payload });
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
