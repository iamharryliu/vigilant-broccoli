import { PREPARATION_KEY } from '@vigilant-broccoli/common-js';

export { PREPARATION_KEY };

export const PREPARATION_BADGES = [
  {
    key: PREPARATION_KEY.WIND_RESISTANT_CLOTHING,
    icon: '🌬️',
    labelKey: 'PREPARATION.WIND_RESISTANT_CLOTHING',
  },
  {
    key: PREPARATION_KEY.RAIN_RESISTANT_CLOTHING,
    icon: '☔',
    labelKey: 'PREPARATION.RAIN_RESISTANT_CLOTHING',
  },
  {
    key: PREPARATION_KEY.SNOW_RESISTANT_CLOTHING,
    icon: '🧥',
    labelKey: 'PREPARATION.SNOW_RESISTANT_CLOTHING',
  },
  {
    key: PREPARATION_KEY.SUNGLASSES,
    icon: '🕶️',
    labelKey: 'PREPARATION.SUNGLASSES',
  },
] as const;
