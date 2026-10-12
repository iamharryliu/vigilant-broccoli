import { HTTP_HEADERS, Location } from '@vigilant-broccoli/common-js';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_CITY_ZOOM = '10';
const NOMINATIM_FORMAT = 'jsonv2';
const NOMINATIM_LANGUAGE = 'en';
const GEOCODE_REVALIDATE_SECONDS = 60 * 60 * 24;
const USER_AGENT_HEADER = 'User-Agent';

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

/**
 * Best-effort city name for a coordinate; resolves `null` on any failure so a
 * missing label never fails the caller. Nominatim's usage policy rejects
 * requests without an identifying `userAgent`, so each app passes its own.
 */
export const reverseGeocodeCity = async (
  { latitude, longitude }: Location,
  userAgent: string,
): Promise<string | null> => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    zoom: NOMINATIM_CITY_ZOOM,
    format: NOMINATIM_FORMAT,
    'accept-language': NOMINATIM_LANGUAGE,
  });
  // `next` is Next.js's fetch cache option; plain Node fetch ignores it.
  const init = {
    headers: {
      ...HTTP_HEADERS.ACCEPT.JSON,
      [USER_AGENT_HEADER]: userAgent,
    },
    next: { revalidate: GEOCODE_REVALIDATE_SECONDS },
  };
  const response = await fetch(
    `${NOMINATIM_REVERSE_URL}?${params}`,
    init,
  ).catch(() => null);
  if (!response?.ok) return null;

  const { name, address }: NominatimReverseResponse = await response
    .json()
    .catch(() => ({}));
  return (
    CITY_ADDRESS_FIELDS.map(field => address?.[field]).find(Boolean) ??
    name ??
    null
  );
};
