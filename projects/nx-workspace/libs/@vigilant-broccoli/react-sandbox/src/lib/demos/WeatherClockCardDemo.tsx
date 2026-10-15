import { ChangeEvent, useMemo, useState } from 'react';
import {
  Input,
  LOCAL_WEATHER_STATUS,
  SegmentedControl,
  Switch,
} from '@vigilant-broccoli/react-lib';
import {
  WeatherClockCardUtilityContent,
  WeatherClockCardWeather,
} from '@vigilant-broccoli/react-utility';
import {
  ForecastDay,
  Preparation,
  OPEN_METEO_MAX_FORECAST_DAYS,
  WEATHER_CONDITION,
  WEATHER_CONDITIONS,
} from '@vigilant-broccoli/common-js';

const SCENARIO = {
  LOADING: 'LOADING',
  ERROR: 'ERROR',
  COLLAPSED: 'COLLAPSED',
  EXPANDED_FULL: 'EXPANDED_FULL',
  EXPANDED_FEW: 'EXPANDED_FEW',
} as const;
type Scenario = (typeof SCENARIO)[keyof typeof SCENARIO];

const SCENARIO_LABEL: Record<Scenario, string> = {
  [SCENARIO.LOADING]: 'Loading',
  [SCENARIO.ERROR]: 'Error',
  [SCENARIO.COLLAPSED]: 'Collapsed',
  [SCENARIO.EXPANDED_FULL]: `Expanded, ${OPEN_METEO_MAX_FORECAST_DAYS} days`,
  [SCENARIO.EXPANDED_FEW]: 'Expanded, fewer days',
};

const WIDTH = { FULL: 'FULL', MOBILE: 'MOBILE' } as const;
type Width = (typeof WIDTH)[keyof typeof WIDTH];

const WIDTH_LABEL: Record<Width, string> = {
  [WIDTH.FULL]: 'Full width',
  [WIDTH.MOBILE]: 'Mobile (393px)',
};

const WIDTH_CLASS: Record<Width, string> = {
  [WIDTH.FULL]: 'w-full',
  [WIDTH.MOBILE]: 'w-[393px] max-w-full',
};

const FEW_DAYS_COUNT = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ISO_DATE_LENGTH = 10;
const BASE_HIGH_C = 18;
const BASE_LOW_C = 9;

const DEMO_LOCATION = { latitude: 55.605, longitude: 13.0038 };
const DEMO_TIMEZONE_OFFSET_SECONDS = 7200;

const buildForecast = (count: number): ForecastDay[] =>
  Array.from({ length: count }, (_, index) => ({
    date: new Date(Date.now() + index * MS_PER_DAY)
      .toISOString()
      .slice(0, ISO_DATE_LENGTH),
    highC: BASE_HIGH_C + (index % 5) - 2,
    lowC: BASE_LOW_C + (index % 4) - 1,
    condition: WEATHER_CONDITIONS[index % WEATHER_CONDITIONS.length],
    precipitationSumMm: (index % 3) * 1.4,
  }));

const NUMBER_FIELDS = [
  { key: 'temperatureC', label: 'Temperature (°C)' },
  { key: 'feelsLikeC', label: 'Feels like (°C)' },
  { key: 'highC', label: 'High (°C)' },
  { key: 'lowC', label: 'Low (°C)' },
  { key: 'humidityPercent', label: 'Humidity (%)' },
  { key: 'windSpeedKph', label: 'Wind (km/h)' },
  { key: 'windMaxKph', label: 'Wind max (km/h)' },
  { key: 'precipitationMm', label: 'Precipitation (mm)' },
  { key: 'precipitationSumMm', label: 'Precipitation today (mm)' },
] as const;

const PREPARATION_FIELDS: { key: keyof Preparation; label: string }[] = [
  { key: 'windResistantClothing', label: 'Wind-resistant clothing' },
  { key: 'rainResistantClothing', label: 'Rain-resistant clothing' },
  { key: 'snowResistantClothing', label: 'Snow-resistant clothing' },
  { key: 'sunglasses', label: 'Sunglasses' },
];

const CONDITION_LABEL: Record<string, string> = {
  CLEAR: 'Clear',
  PARTLY_CLOUDY: 'Partly cloudy',
  CLOUDY: 'Cloudy',
  FOG: 'Foggy',
  DRIZZLE: 'Drizzle',
  RAIN: 'Rain',
  SNOW: 'Snow',
  THUNDERSTORM: 'Thunderstorm',
};

const buildWeather = (forecastDays: number): WeatherClockCardWeather => ({
  city: 'Malmö',
  temperatureC: 18,
  feelsLikeC: 16,
  highC: BASE_HIGH_C,
  lowC: BASE_LOW_C,
  humidityPercent: 72,
  windSpeedKph: 14,
  windMaxKph: 27,
  precipitationMm: 0.2,
  precipitationSumMm: 1.4,
  condition: WEATHER_CONDITION.PARTLY_CLOUDY,
  isDay: true,
  forecast: buildForecast(forecastDays),
  preparation: {
    windResistantClothing: true,
    rainResistantClothing: true,
    snowResistantClothing: false,
    sunglasses: true,
  },
});

export const WeatherClockCardDemo = () => {
  const [scenario, setScenario] = useState<Scenario>(SCENARIO.EXPANDED_FULL);
  const [width, setWidth] = useState<Width>(WIDTH.FULL);

  const [overrides, setOverrides] = useState<Partial<WeatherClockCardWeather>>(
    {},
  );
  const [preparation, setPreparation] = useState<Preparation>(
    () => buildWeather(0).preparation as Preparation,
  );

  const weather = useMemo(
    () => ({
      ...buildWeather(
        scenario === SCENARIO.EXPANDED_FEW
          ? FEW_DAYS_COUNT
          : OPEN_METEO_MAX_FORECAST_DAYS,
      ),
      ...overrides,
      preparation,
    }),
    [scenario, overrides, preparation],
  );
  const updateWeather = (patch: Partial<WeatherClockCardWeather>) =>
    setOverrides(previous => ({ ...previous, ...patch }));
  const isStatic = scenario === SCENARIO.LOADING || scenario === SCENARIO.ERROR;

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <SegmentedControl
        label="State"
        value={scenario}
        onChange={setScenario}
        className="flex-wrap"
        options={Object.values(SCENARIO).map(value => ({
          value,
          label: SCENARIO_LABEL[value],
        }))}
      />
      <SegmentedControl
        label="Width"
        value={width}
        onChange={setWidth}
        options={Object.values(WIDTH).map(value => ({
          value,
          label: WIDTH_LABEL[value],
        }))}
      />

      {!isStatic && (
        <div className="flex w-full flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <label className="flex flex-col gap-1 text-sm">
              City
              <Input
                value={weather.city ?? ''}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateWeather({ city: event.target.value })
                }
              />
            </label>
            {NUMBER_FIELDS.map(({ key, label }) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                {label}
                <Input
                  type="number"
                  value={weather[key]}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateWeather({ [key]: Number(event.target.value) })
                  }
                />
              </label>
            ))}
          </div>
          <SegmentedControl
            label="Condition"
            value={weather.condition}
            onChange={condition => updateWeather({ condition })}
            className="flex-wrap"
            options={WEATHER_CONDITIONS.map(condition => ({
              value: condition,
              label: CONDITION_LABEL[condition],
            }))}
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch
                checked={weather.isDay}
                onCheckedChange={isDay => updateWeather({ isDay })}
              />
              Daytime
            </label>
            {PREPARATION_FIELDS.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Switch
                  checked={preparation[key]}
                  onCheckedChange={checked =>
                    setPreparation(previous => ({
                      ...previous,
                      [key]: checked,
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      <WeatherClockCardUtilityContent
        key={scenario}
        className={WIDTH_CLASS[width]}
        location={DEMO_LOCATION}
        timezoneOffsetSeconds={DEMO_TIMEZONE_OFFSET_SECONDS}
        weather={isStatic ? undefined : weather}
        loading={scenario === SCENARIO.LOADING}
        error={
          scenario === SCENARIO.ERROR
            ? LOCAL_WEATHER_STATUS.WEATHER_ERROR
            : undefined
        }
        defaultExpanded={
          scenario === SCENARIO.EXPANDED_FULL ||
          scenario === SCENARIO.EXPANDED_FEW
        }
      />
    </div>
  );
};
