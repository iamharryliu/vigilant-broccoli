import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { reverseGeocodeCity } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Nominatim's usage policy rejects requests without an identifying User-Agent.
const NOMINATIM_USER_AGENT = 'local-manager-next (https://harryliu.dev)';

const LAT_PARAM = 'lat';
const LON_PARAM = 'lon';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = Number(searchParams.get(LAT_PARAM));
  const longitude = Number(searchParams.get(LON_PARAM));

  if (!latitude || !longitude) {
    return NextResponse.json(
      { success: false, error: 'Missing lat or lon parameters' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const city = await reverseGeocodeCity(
    { latitude, longitude },
    NOMINATIM_USER_AGENT,
  );
  return NextResponse.json({ city });
}
