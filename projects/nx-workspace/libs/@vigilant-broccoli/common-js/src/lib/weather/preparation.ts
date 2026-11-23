import { LocalWeather, Preparation } from './local-weather';
import { WEATHER_CONDITION, WeatherCondition } from './weather.model';

/** Product heuristics, rather than safety guidance or provider thresholds. */
export const WEATHER_PREPARATION_THRESHOLDS = {
  GUST_KPH: 50,
  CURRENT_PRECIPITATION_MM: 0.1,
  DAILY_PRECIPITATION_MM: 1,
  CURRENT_SNOWFALL_CM: 0.1,
  DAILY_SNOWFALL_CM: 0.5,
} as const;

const CONDITION_PREPARATION: Record<
  WeatherCondition,
  { rain: boolean; snow: boolean; sunglasses: boolean }
> = {
  [WEATHER_CONDITION.CLEAR]: { rain: false, snow: false, sunglasses: true },
  [WEATHER_CONDITION.PARTLY_CLOUDY]: {
    rain: false,
    snow: false,
    sunglasses: true,
  },
  [WEATHER_CONDITION.CLOUDY]: { rain: false, snow: false, sunglasses: false },
  [WEATHER_CONDITION.FOG]: { rain: false, snow: false, sunglasses: false },
  [WEATHER_CONDITION.DRIZZLE]: { rain: true, snow: false, sunglasses: false },
  [WEATHER_CONDITION.RAIN]: { rain: true, snow: false, sunglasses: false },
  [WEATHER_CONDITION.SNOW]: { rain: false, snow: true, sunglasses: false },
  [WEATHER_CONDITION.THUNDERSTORM]: {
    rain: true,
    snow: false,
    sunglasses: false,
  },
};

export const calculateWeatherPreparation = (
  weather: LocalWeather,
): Preparation => {
  const thresholds = WEATHER_PREPARATION_THRESHOLDS;
  const current = CONDITION_PREPARATION[weather.condition];
  const today = weather.forecast?.[0];
  const daily = today ? CONDITION_PREPARATION[today.condition] : undefined;
  // Provider totals include snow water equivalent; snow alone must not imply rain.
  const currentWet =
    !current.snow &&
    weather.precipitationMm >= thresholds.CURRENT_PRECIPITATION_MM;
  // The daily condition is the day's worst code, so a trace of rain must not count without a measurable total.
  const dailyWet =
    !current.snow &&
    !daily?.snow &&
    weather.precipitationSumMm >= thresholds.DAILY_PRECIPITATION_MM;
  const currentRain =
    current.rain &&
    (weather.condition !== WEATHER_CONDITION.DRIZZLE || currentWet);

  return {
    windResistantClothing:
      Math.max(weather.windGustKph, weather.windGustMaxKph) >
      thresholds.GUST_KPH,
    rainResistantClothing: currentRain || currentWet || dailyWet,
    snowResistantClothing:
      current.snow ||
      weather.snowfallCm >= thresholds.CURRENT_SNOWFALL_CM ||
      weather.snowfallSumCm >= thresholds.DAILY_SNOWFALL_CM,
    sunglasses: weather.isDay && current.sunglasses,
  };
};
