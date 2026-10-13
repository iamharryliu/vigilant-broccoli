import type { Preparation } from '@vigilant-broccoli/react-lib';

export const WEATHER_API_PATH = '/api/weather';

export const QUERY_PARAM = {
  LAT: 'lat',
  LON: 'lon',
};

export const PREPARATION_API_PATH = '/api/preparation';

export const PREPARATION_KEY = {
  WIND_RESISTANT_CLOTHING: 'windResistantClothing',
  RAIN_RESISTANT_CLOTHING: 'rainResistantClothing',
  SNOW_RESISTANT_CLOTHING: 'snowResistantClothing',
  SUNGLASSES: 'sunglasses',
} as const satisfies Record<string, keyof Preparation>;
