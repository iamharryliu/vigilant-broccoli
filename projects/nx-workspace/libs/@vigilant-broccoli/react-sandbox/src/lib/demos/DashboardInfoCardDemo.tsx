import { useMemo, useState } from 'react';
import {
  LOCAL_WEATHER_STATUS,
  SegmentedControl,
} from '@vigilant-broccoli/react-lib';
import {
  DashboardInfoCardUtilityContent,
  DashboardInfoCardWeather,
} from '@vigilant-broccoli/react-utility';
import {
  ForecastDay,
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

const WIDTH = { FULL: 'FULL', NARROW: 'NARROW' } as const;
type Width = (typeof WIDTH)[keyof typeof WIDTH];

const WIDTH_LABEL: Record<Width, string> = {
  [WIDTH.FULL]: 'Full width',
  [WIDTH.NARROW]: 'Narrow (320px)',
};

const WIDTH_CLASS: Record<Width, string> = {
  [WIDTH.FULL]: 'w-full',
  [WIDTH.NARROW]: 'w-[320px] max-w-full',
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

const buildWeather = (forecastDays: number): DashboardInfoCardWeather => ({
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

export const DashboardInfoCardDemo = () => {
  const [scenario, setScenario] = useState<Scenario>(SCENARIO.EXPANDED_FULL);
  const [width, setWidth] = useState<Width>(WIDTH.FULL);

  const weather = useMemo(
    () =>
      buildWeather(
        scenario === SCENARIO.EXPANDED_FEW
          ? FEW_DAYS_COUNT
          : OPEN_METEO_MAX_FORECAST_DAYS,
      ),
    [scenario],
  );
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

      <DashboardInfoCardUtilityContent
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
