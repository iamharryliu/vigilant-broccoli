import { NextRequest } from 'next/server';
import {
  HTTP_HEADERS,
  HTTP_STATUS_CODES,
  Location,
  WEATHER_PROVIDER,
} from '@vigilant-broccoli/common-js';
import { WeatherService } from '@vigilant-broccoli/common-node';
import { QUERY_PARAM } from '../../../lib/weather.consts';
import { LocalWeather } from '../../../lib/weather.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
// Nominatim's usage policy rejects requests without an identifying User-Agent.
const NOMINATIM_USER_AGENT =
  'vibecheck-lite-next (https://vibecheck-lite.harryliu.dev)';
const NOMINATIM_CITY_ZOOM = '10';
const NOMINATIM_FORMAT = 'jsonv2';
const NOMINATIM_LANGUAGE = 'en';
const GEOCODE_REVALIDATE_SECONDS = 60 * 60 * 24;
const USER_AGENT_HEADER = 'User-Agent';

// ~1 km of precision is plenty for city-level weather, keeps the user's exact
// position out of upstream logs, and lets nearby requests share cached lookups.
const COORDINATE_DECIMALS = 2;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const TODAY_INDEX = 0;
const DAILY_COUNT = 1;
const HOURLY_COUNT = 0;

const INVALID_COORDINATES_ERROR = 'lat and lon must be valid coordinates';
const WEATHER_UNAVAILABLE_ERROR = 'Weather is unavailable';

// Nominatim names the place by its size, so the first field present wins.
const CITY_ADDRESS_FIELDS = [
  'city',
  'town',
  'village',
  'municipality',
] as const;

interface NominatimReverseResponse {
  name?: string;
  address?: Partial<Record<(typeof CITY_ADDRESS_FIELDS)[number], string>>;
}

const parseCoordinate = (value: string | null, max: number): number | null => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && Math.abs(parsed) <= max
    ? Number(parsed.toFixed(COORDINATE_DECIMALS))
    : null;
};

const fetchCityName = async ({
  latitude,
  longitude,
}: Location): Promise<string | null> => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    zoom: NOMINATIM_CITY_ZOOM,
    format: NOMINATIM_FORMAT,
    'accept-language': NOMINATIM_LANGUAGE,
  });
  const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, {
    headers: {
      ...HTTP_HEADERS.ACCEPT.JSON,
      [USER_AGENT_HEADER]: NOMINATIM_USER_AGENT,
    },
    next: { revalidate: GEOCODE_REVALIDATE_SECONDS },
  });
  if (!response.ok) return null;
  const { name, address }: NominatimReverseResponse = await response.json();
  return (
    CITY_ADDRESS_FIELDS.map(field => address?.[field]).find(Boolean) ??
    name ??
    null
  );
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latitude = parseCoordinate(
    searchParams.get(QUERY_PARAM.LAT),
    MAX_LATITUDE,
  );
  const longitude = parseCoordinate(
    searchParams.get(QUERY_PARAM.LON),
    MAX_LONGITUDE,
  );

  if (latitude === null || longitude === null) {
    return Response.json(
      { error: INVALID_COORDINATES_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const location = { latitude, longitude };
  // A missing city name only degrades the label, so it must not fail the
  // weather that was fetched successfully alongside it.
  const [weather, city] = await Promise.all([
    WeatherService.getWeather(location, {
      provider: WEATHER_PROVIDER.OPEN_METEO,
      hourlyCount: HOURLY_COUNT,
      dailyCount: DAILY_COUNT,
    }).catch(() => null),
    fetchCityName(location).catch(() => null),
  ]);

  const today = weather?.daily[TODAY_INDEX];
  if (!weather || !today) {
    return Response.json(
      { error: WEATHER_UNAVAILABLE_ERROR },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }

  const body: LocalWeather = {
    city,
    temperatureC: weather.current.temperatureC,
    feelsLikeC: weather.current.feelsLikeC,
    highC: today.tempMaxC,
    lowC: today.tempMinC,
    condition: weather.current.condition,
    isDay: weather.current.isDay,
  };
  return Response.json(body);
}
