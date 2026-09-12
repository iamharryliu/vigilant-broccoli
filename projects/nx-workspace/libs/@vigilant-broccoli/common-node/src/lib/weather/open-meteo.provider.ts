import {
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
  Location,
  WEATHER_CONDITION,
  WEATHER_PROVIDER,
  WeatherCondition,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import {
  ISO_DATE_LENGTH,
  MS_PER_SECOND,
  OPEN_METEO_BASE_URL,
} from './weather.consts';

interface OpenMeteoResponse {
  utc_offset_seconds: number;
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    weather_code: number[];
  };
}

const CURRENT_FIELDS =
  'temperature_2m,apparent_temperature,weather_code,is_day';
const HOURLY_FIELDS = 'temperature_2m,weather_code,is_day';
const DAILY_FIELDS = 'temperature_2m_min,temperature_2m_max,weather_code';
const TIMEZONE_PARAM = 'auto';

/**
 * WMO 4677 code groups, as documented by Open-Meteo.
 */
const WMO_CODE_CONDITIONS = (): Array<{
  codes: number[];
  condition: WeatherCondition;
}> => [
  { codes: [0], condition: WEATHER_CONDITION.CLEAR },
  { codes: [1, 2], condition: WEATHER_CONDITION.PARTLY_CLOUDY },
  { codes: [3], condition: WEATHER_CONDITION.CLOUDY },
  { codes: [45, 48], condition: WEATHER_CONDITION.FOG },
  { codes: [51, 53, 55, 56, 57], condition: WEATHER_CONDITION.DRIZZLE },
  {
    codes: [61, 63, 65, 66, 67, 80, 81, 82],
    condition: WEATHER_CONDITION.RAIN,
  },
  {
    codes: [71, 73, 75, 77, 85, 86],
    condition: WEATHER_CONDITION.SNOW,
  },
  { codes: [95, 96, 99], condition: WEATHER_CONDITION.THUNDERSTORM },
];

let wmoCodeMap: Map<number, WeatherCondition> | null = null;

const getWmoCodeMap = (): Map<number, WeatherCondition> => {
  if (!wmoCodeMap) {
    wmoCodeMap = new Map(
      WMO_CODE_CONDITIONS().flatMap(({ codes, condition }) =>
        codes.map(code => [code, condition] as [number, WeatherCondition]),
      ),
    );
  }
  return wmoCodeMap;
};

const toConditionFromWmoCode = (code: number): WeatherCondition =>
  getWmoCodeMap().get(code) ?? WEATHER_CONDITION.CLOUDY;

/**
 * Open-Meteo returns local wall-clock stamps without an offset when
 * `timezone=auto`, so the offset it reports is what makes them absolute.
 */
const toTimestampMs = (localTime: string, offsetSeconds: number): number =>
  Date.parse(`${localTime}Z`) - offsetSeconds * MS_PER_SECOND;

const buildUrl = (location: Location, dailyCount: number): string => {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    timezone: TIMEZONE_PARAM,
    forecast_days: String(dailyCount),
  });
  return `${OPEN_METEO_BASE_URL}?${params}`;
};

const toCurrent = (data: OpenMeteoResponse): CurrentWeather => ({
  temperatureC: data.current.temperature_2m,
  feelsLikeC: data.current.apparent_temperature,
  condition: toConditionFromWmoCode(data.current.weather_code),
  isDay: Boolean(data.current.is_day),
});

const toHourly = (
  data: OpenMeteoResponse,
  hourlyCount: number,
): HourlyWeather[] => {
  const nowMs = Date.now();
  return data.hourly.time
    .map((time, index) => ({
      timestampMs: toTimestampMs(time, data.utc_offset_seconds),
      temperatureC: data.hourly.temperature_2m[index],
      condition: toConditionFromWmoCode(data.hourly.weather_code[index]),
      isDay: Boolean(data.hourly.is_day[index]),
    }))
    .filter(entry => entry.timestampMs >= nowMs)
    .slice(0, hourlyCount);
};

const toDaily = (data: OpenMeteoResponse, dailyCount: number): DailyWeather[] =>
  data.daily.time.slice(0, dailyCount).map((date, index) => ({
    date: date.slice(0, ISO_DATE_LENGTH),
    tempMinC: data.daily.temperature_2m_min[index],
    tempMaxC: data.daily.temperature_2m_max[index],
    condition: toConditionFromWmoCode(data.daily.weather_code[index]),
  }));

export const fetchOpenMeteoSnapshot = async (
  location: Location,
  hourlyCount: number,
  dailyCount: number,
): Promise<WeatherSnapshot> => {
  const response = await fetch(buildUrl(location, dailyCount));

  if (!response.ok) {
    throw new Error(
      `Open-Meteo API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: OpenMeteoResponse = await response.json();

  return {
    provider: WEATHER_PROVIDER.OPEN_METEO,
    location,
    timezoneOffsetSeconds: data.utc_offset_seconds,
    current: toCurrent(data),
    hourly: toHourly(data, hourlyCount),
    daily: toDaily(data, dailyCount),
  };
};
