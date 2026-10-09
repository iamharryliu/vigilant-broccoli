export const NEARBY_RADIUS_METRES = 250;
export const NEARBY_REFRESH_MIN_MOVEMENT_METRES = 50;
export const NEARBY_REFRESH_MIN_INTERVAL_MS = 60_000;
export const NEARBY_MANUAL_REFRESH_COOLDOWN_MS = 5_000;
export const NEARBY_ELIGIBILITY_CHECK_INTERVAL_MS = 5_000;
export const NEARBY_REQUEST_TIMEOUT_MS = 15_000;
export const OVERPASS_SERVER_TIMEOUT_SECONDS = 10;
export const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
] as const;
export const OVERPASS_FORM_DATA_FIELD = 'data';
export const OVERPASS_RUNTIME_ERROR_PATTERN = /runtime error/i;

export const OVERPASS_ELEMENT_TYPE = {
  NODE: 'node',
  WAY: 'way',
  RELATION: 'relation',
} as const;

export const PLACE_CATEGORY = {
  SHOP: 'SHOP',
  FOOD_DRINK: 'FOOD_DRINK',
  PARK: 'PARK',
  NATURE: 'NATURE',
  ATTRACTION: 'ATTRACTION',
} as const;

export type PlaceCategory =
  (typeof PLACE_CATEGORY)[keyof typeof PLACE_CATEGORY];

interface CategoryFilter {
  category: PlaceCategory;
  key: string;
  values?: readonly string[];
  requireName?: boolean;
}

export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  { category: PLACE_CATEGORY.SHOP, key: 'shop' },
  {
    category: PLACE_CATEGORY.FOOD_DRINK,
    key: 'amenity',
    values: [
      'restaurant',
      'cafe',
      'bar',
      'pub',
      'fast_food',
      'food_court',
      'ice_cream',
      'biergarten',
    ],
  },
  {
    category: PLACE_CATEGORY.PARK,
    key: 'leisure',
    values: ['park', 'garden', 'nature_reserve', 'playground'],
  },
  {
    category: PLACE_CATEGORY.NATURE,
    key: 'natural',
    values: [
      'water',
      'beach',
      'peak',
      'wood',
      'spring',
      'cliff',
      'cave_entrance',
      'hot_spring',
    ],
    requireName: true,
  },
  {
    category: PLACE_CATEGORY.ATTRACTION,
    key: 'tourism',
    values: [
      'attraction',
      'museum',
      'gallery',
      'viewpoint',
      'artwork',
      'zoo',
      'theme_park',
      'aquarium',
    ],
  },
  {
    category: PLACE_CATEGORY.ATTRACTION,
    key: 'historic',
    values: ['monument', 'memorial', 'castle', 'ruins', 'archaeological_site'],
  },
];
