import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getLocalWeather } from '@vigilant-broccoli/common-node';
import { requireAuth } from '../../../../libs/api-auth';
import { WEATHER_QUERY_PARAM } from '../../app.const';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Nominatim's usage policy rejects requests without an identifying User-Agent.
const NOMINATIM_USER_AGENT = 'vb-manager-next-mobile (https://harryliu.dev)';

// ~1 km of precision is plenty for city-level weather and keeps the user's
// exact position out of upstream logs.
const COORDINATE_DECIMALS = 2;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

const INVALID_COORDINATES_ERROR = 'lat and lon must be valid coordinates';
const WEATHER_UNAVAILABLE_ERROR = 'Weather is unavailable';

const parseCoordinate = (value: string | null, max: number): number | null => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && Math.abs(parsed) <= max
    ? Number(parsed.toFixed(COORDINATE_DECIMALS))
    : null;
};

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = request.nextUrl;
  const latitude = parseCoordinate(
    searchParams.get(WEATHER_QUERY_PARAM.LAT),
    MAX_LATITUDE,
  );
  const longitude = parseCoordinate(
    searchParams.get(WEATHER_QUERY_PARAM.LON),
    MAX_LONGITUDE,
  );

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      { error: INVALID_COORDINATES_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const body = await getLocalWeather(
    { latitude, longitude },
    NOMINATIM_USER_AGENT,
  );
  if (!body) {
    return NextResponse.json(
      { error: WEATHER_UNAVAILABLE_ERROR },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
  return NextResponse.json(body);
}
