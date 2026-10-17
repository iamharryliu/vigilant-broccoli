import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { reverseGeocodeCity } from '@vigilant-broccoli/common-node';

// Nominatim's usage policy rejects requests without an identifying User-Agent.
const NOMINATIM_USER_AGENT = 'vb-manager-local-fastify (https://harryliu.dev)';

const LAT_PARAM = 'lat';
const LON_PARAM = 'lon';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const latitude = Number(searchParams.get(LAT_PARAM));
  const longitude = Number(searchParams.get(LON_PARAM));

  if (!latitude || !longitude) {
    return Response.json(
      { success: false, error: 'Missing lat or lon parameters' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const city = await reverseGeocodeCity(
    { latitude, longitude },
    NOMINATIM_USER_AGENT,
  );
  return Response.json({ city });
}
