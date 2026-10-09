import {
  CATEGORY_FILTERS,
  NEARBY_RADIUS_METRES,
  NEARBY_REQUEST_TIMEOUT_MS,
  OVERPASS_ELEMENT_TYPE,
  OVERPASS_ENDPOINTS,
  OVERPASS_FORM_DATA_FIELD,
  OVERPASS_RUNTIME_ERROR_PATTERN,
  OVERPASS_SERVER_TIMEOUT_SECONDS,
  PlaceCategory,
} from '../app/consts/nearby.consts';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  Bounds,
  Coordinates,
  distanceMetres,
  distanceToBoundsMetres,
} from './geo';

const NAME_TAGS = ['name', 'brand', 'operator'] as const;
const SAME_PLACE_MAX_SEPARATION_METRES = 30;
const SUBTYPE_SEPARATOR_PATTERN = /_/g;

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
  remark?: string;
}

class OverpassQueryError extends Error {}

export interface Place {
  id: string;
  name: string | null;
  category: PlaceCategory;
  subtype: string;
  lat: number;
  lng: number;
  bounds: Bounds | null;
}

export type PlaceWithDistance = Place & { distanceMetres: number };

const buildFilterClause = (
  filter: (typeof CATEGORY_FILTERS)[number],
  { lat, lng }: Coordinates,
) => {
  const valueMatch = filter.values
    ? `["${filter.key}"~"^(${filter.values.join('|')})$"]`
    : `["${filter.key}"]`;
  const nameMatch = filter.requireName ? '["name"]' : '';
  return `nwr(around:${NEARBY_RADIUS_METRES},${lat},${lng})${valueMatch}${nameMatch};`;
};

export const buildOverpassQuery = (origin: Coordinates): string =>
  `[out:json][timeout:${OVERPASS_SERVER_TIMEOUT_SECONDS}];(${CATEGORY_FILTERS.map(
    filter => buildFilterClause(filter, origin),
  ).join('')});out body bb;`;

const classify = (tags: Record<string, string>) => {
  for (const filter of CATEGORY_FILTERS) {
    const value = tags[filter.key];
    if (!value) continue;
    if (filter.values && !filter.values.includes(value)) continue;
    if (filter.requireName && !tags.name) continue;
    return { category: filter.category, subtype: value };
  }
  return null;
};

const toPlace = (element: OverpassElement): Place | null => {
  const tags = element.tags ?? {};
  const classification = classify(tags);
  const isArea = element.type !== OVERPASS_ELEMENT_TYPE.NODE;
  const bounds = isArea ? element.bounds : undefined;
  const lat = element.lat ?? (bounds && (bounds.minlat + bounds.maxlat) / 2);
  const lng = element.lon ?? (bounds && (bounds.minlon + bounds.maxlon) / 2);
  if (!classification || lat === undefined || lng === undefined) return null;
  const nameTag = NAME_TAGS.find(tag => tags[tag]);
  return {
    id: `${element.type}/${element.id}`,
    name: nameTag ? tags[nameTag] : null,
    category: classification.category,
    subtype: classification.subtype.replace(SUBTYPE_SEPARATOR_PATTERN, ' '),
    lat,
    lng,
    bounds: bounds
      ? {
          minLat: bounds.minlat,
          minLng: bounds.minlon,
          maxLat: bounds.maxlat,
          maxLng: bounds.maxlon,
        }
      : null,
  };
};

const isSamePlace = (a: Place, b: Place) =>
  a.id === b.id ||
  (a.name !== null &&
    a.name.toLowerCase() === b.name?.toLowerCase() &&
    a.category === b.category &&
    distanceMetres(a, b) <= SAME_PLACE_MAX_SEPARATION_METRES);

export const parseOverpassPlaces = (response: OverpassResponse): Place[] =>
  (response.elements ?? []).reduce<Place[]>((places, element) => {
    const place = toPlace(element);
    if (place && !places.some(existing => isSamePlace(existing, place))) {
      places.push(place);
    }
    return places;
  }, []);

/**
 * Distance rule: a point POI uses the straight line to its coordinates. An
 * area POI (way/relation) uses the straight line to the nearest point of its
 * bounding box, so it is 0 when the user is inside the box and a large park
 * whose centre is far away is still measured by its nearest edge.
 */
export const getPlaceDistanceMetres = (
  place: Place,
  origin: Coordinates,
): number =>
  place.bounds
    ? distanceToBoundsMetres(origin, place.bounds)
    : distanceMetres(origin, place);

export const withDistances = (
  places: Place[],
  origin: Coordinates,
): PlaceWithDistance[] =>
  places
    .map(place => ({
      ...place,
      distanceMetres: getPlaceDistanceMetres(place, origin),
    }))
    .sort((a, b) => a.distanceMetres - b.distanceMetres);

const fetchFromEndpoint = async (
  endpoint: string,
  query: string,
  signal: AbortSignal,
): Promise<Place[]> => {
  const response = await fetch(endpoint, {
    method: HTTP_METHOD.POST,
    body: new URLSearchParams({ [OVERPASS_FORM_DATA_FIELD]: query }),
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(NEARBY_REQUEST_TIMEOUT_MS),
    ]),
  });
  if (response.status === HTTP_STATUS_CODES.BAD_REQUEST) {
    throw new OverpassQueryError('Overpass rejected the query');
  }
  if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
  const body = (await response.json()) as OverpassResponse;
  if (
    !Array.isArray(body.elements) ||
    OVERPASS_RUNTIME_ERROR_PATTERN.test(body.remark ?? '')
  ) {
    throw new Error('Overpass returned an incomplete result');
  }
  return parseOverpassPlaces(body);
};

export async function fetchNearbyPlaces(
  origin: Coordinates,
  signal: AbortSignal,
): Promise<Place[]> {
  const query = buildOverpassQuery(origin);
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await fetchFromEndpoint(endpoint, query, signal);
    } catch (error) {
      if (signal.aborted || error instanceof OverpassQueryError) throw error;
      lastError = error;
    }
  }
  throw lastError;
}
