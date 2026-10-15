'use client';

import { createI18n } from '../i18n';

const DEFAULT_LOCALE = 'en';

const en = {
  STATUS: {
    LOADING_WEATHER: 'Checking the sky…',
    LOADING_PREPARATION: 'Checking what to wear or bring…',
  },
  LOCATION: {
    FALLBACK: 'Your location',
    DENIED_TITLE: 'Location is turned off',
    DENIED_MESSAGE:
      'Allow location access in your browser so we can show the weather where you are.',
    UNAVAILABLE_TITLE: "Couldn't find you",
    UNAVAILABLE_MESSAGE:
      "Your location isn't available right now. Check your connection or device settings and try again.",
  },
  WEATHER: {
    ERROR_TITLE: 'Weather is unavailable',
    ERROR_MESSAGE:
      "We couldn't load the weather right now. Please try again in a moment.",
    HIGH: 'H {temperature}°',
    LOW: 'L {temperature}°',
    FEELS_LIKE: 'Feels {temperature}°',
    HUMIDITY: 'Humidity',
    WIND_VALUE: '{speed} km/h',
    WIND_MAX: 'Wind (max {max})',
    PRECIPITATION_VALUE: '{amount} mm',
    PRECIPITATION_SUM: '{sum} mm today',
  },
  CONDITION: {
    CLEAR: 'Clear',
    PARTLY_CLOUDY: 'Partly cloudy',
    CLOUDY: 'Cloudy',
    FOG: 'Foggy',
    DRIZZLE: 'Drizzle',
    RAIN: 'Rain',
    SNOW: 'Snow',
    THUNDERSTORM: 'Thunderstorm',
  },
  PREPARATION: {
    WIND_RESISTANT_CLOTHING: 'Wind-resistant clothing',
    RAIN_RESISTANT_CLOTHING: 'Rain-resistant clothing',
    SNOW_RESISTANT_CLOTHING: 'Snow-resistant clothing',
    SUNGLASSES: 'Sunglasses',
  },
  FORECAST: {
    LABEL: 'Forecast',
    TODAY: 'Today',
    PRECIPITATION: '{amount} mm',
    RANGE: 'High {high}°, low {low}°',
  },
  ACTIONS: {
    RETRY: 'Try again',
  },
  ATTRIBUTION: {
    WEATHER: 'Weather by Open-Meteo',
    LOCATION: 'Places © OpenStreetMap contributors',
  },
};

export const { I18nProvider: WeatherI18nProvider, useTranslation } = createI18n(
  {
    defaultLocale: DEFAULT_LOCALE,
    dictionaries: { [DEFAULT_LOCALE]: en },
  },
);
