import { NextRequest, NextResponse } from 'next/server';
import { HTTP_HEADERS, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
// Nominatim's usage policy rejects requests without an identifying User-Agent.
const NOMINATIM_USER_AGENT = 'vb-manager-next (https://harryliu.dev)';
const NOMINATIM_CITY_ZOOM = '10';
const NOMINATIM_FORMAT = 'jsonv2';
const NOMINATIM_LANGUAGE = 'en';
const GEOCODE_REVALIDATE_SECONDS = 60 * 60 * 24;
const USER_AGENT_HEADER = 'User-Agent';

const LAT_PARAM = 'lat';
const LON_PARAM = 'lon';

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

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
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
  }).catch(() => null);
  if (!response?.ok) return NextResponse.json({ city: null });

  const { name, address }: NominatimReverseResponse = await response
    .json()
    .catch(() => ({}));
  const city =
    CITY_ADDRESS_FIELDS.map(field => address?.[field]).find(Boolean) ??
    name ??
    null;
  return NextResponse.json({ city });
}
