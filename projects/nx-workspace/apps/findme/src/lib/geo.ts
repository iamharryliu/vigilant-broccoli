const EARTH_RADIUS_METRES = 6371000;
const DEGREES_TO_RADIANS = Math.PI / 180;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Bounds {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const distanceMetres = (a: Coordinates, b: Coordinates): number => {
  const dLat = (b.lat - a.lat) * DEGREES_TO_RADIANS;
  const dLng = (b.lng - a.lng) * DEGREES_TO_RADIANS;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEGREES_TO_RADIANS) *
      Math.cos(b.lat * DEGREES_TO_RADIANS) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const distanceToBoundsMetres = (
  point: Coordinates,
  bounds: Bounds,
): number =>
  distanceMetres(point, {
    lat: clamp(point.lat, bounds.minLat, bounds.maxLat),
    lng: clamp(point.lng, bounds.minLng, bounds.maxLng),
  });
