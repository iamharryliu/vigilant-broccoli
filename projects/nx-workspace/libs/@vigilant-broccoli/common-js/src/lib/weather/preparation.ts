import { LocalWeather, Preparation } from './local-weather';
import { WEATHER_CONDITION, WeatherCondition } from './weather.model';

/** Product heuristics, rather than safety guidance or provider thresholds. */
export const WEATHER_PREPARATION_THRESHOLDS = {
  WIND_KPH: 25,
  COLD_FEELS_LIKE_C: 10,
  CURRENT_PRECIPITATION_MM: 0.1,
  DAILY_PRECIPITATION_MM: 1,
  FREEZING_C: 0,
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
  const dailyWet =
    !current.snow &&
    !daily?.snow &&
    weather.precipitationSumMm >= thresholds.DAILY_PRECIPITATION_MM;
  const rain = current.rain || !!daily?.rain || currentWet || dailyWet;
  const freezingWet =
    (weather.temperatureC <= thresholds.FREEZING_C &&
      (current.rain || currentWet)) ||
    (weather.lowC <= thresholds.FREEZING_C && (!!daily?.rain || dailyWet));

  return {
    windResistantClothing:
      Math.max(weather.windSpeedKph, weather.windMaxKph) >
        thresholds.WIND_KPH ||
      weather.feelsLikeC < thresholds.COLD_FEELS_LIKE_C,
    rainResistantClothing: rain,
    snowResistantClothing: current.snow || !!daily?.snow || freezingWet,
    sunglasses: weather.isDay && current.sunglasses,
  };
};
