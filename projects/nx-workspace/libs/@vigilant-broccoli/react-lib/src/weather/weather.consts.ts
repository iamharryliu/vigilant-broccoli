export const PREPARATION_KEY = {
  WIND_RESISTANT_CLOTHING: 'windResistantClothing',
  RAIN_RESISTANT_CLOTHING: 'rainResistantClothing',
  SNOW_RESISTANT_CLOTHING: 'snowResistantClothing',
  SUNGLASSES: 'sunglasses',
} as const;

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
