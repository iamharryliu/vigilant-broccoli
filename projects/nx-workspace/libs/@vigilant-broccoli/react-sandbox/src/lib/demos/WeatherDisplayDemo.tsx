import { ChangeEvent, useEffect, useState } from 'react';
import {
  fetchOpenMeteoSnapshot,
  getWeatherIcon,
  TEMPERATURE_UNIT,
  toDisplayTemperature,
  WEATHER_CONDITION,
  WEATHER_CONDITIONS,
  WeatherCondition,
} from '@vigilant-broccoli/common-js';
import {
  Input,
  SegmentedControl,
  Switch,
  Text,
  WeatherCard,
  WeatherDisplay,
} from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from './weather/i18n';

const DEFAULT_LOCATION = { latitude: 43.6532, longitude: -79.3832 };
const HOURLY_COUNT = 0;
const DAILY_COUNT = 1;
const TODAY_INDEX = 0;

const FETCH_STATUS = {
  LOADING: 'LOADING',
  LIVE: 'LIVE',
  FALLBACK: 'FALLBACK',
} as const;
type FetchStatus = (typeof FETCH_STATUS)[keyof typeof FETCH_STATUS];

const PREPARATION_BADGE = {
  WIND_RESISTANT_CLOTHING: '🌬️',
  RAIN_RESISTANT_CLOTHING: '☔',
  SNOW_RESISTANT_CLOTHING: '🧥',
  SUNGLASSES: '🕶️',
} as const;
type PreparationBadge = keyof typeof PREPARATION_BADGE;
const PREPARATION_BADGES = Object.keys(PREPARATION_BADGE) as PreparationBadge[];

interface DemoWeather {
  temperatureC: number;
  feelsLikeC: number;
  highC: number;
  lowC: number;
  humidityPercent: number;
  windSpeedKph: number;
  condition: WeatherCondition;
  isDay: boolean;
}

const FALLBACK_WEATHER: DemoWeather = {
  temperatureC: 18,
  feelsLikeC: 17,
  highC: 21,
  lowC: 12,
  humidityPercent: 60,
  windSpeedKph: 12,
  condition: WEATHER_CONDITION.PARTLY_CLOUDY,
  isDay: true,
};

const TEMPERATURE_FIELDS = [
  { key: 'temperatureC', labelKey: 'WEATHER_DISPLAY.CONTROLS.TEMPERATURE' },
  { key: 'feelsLikeC', labelKey: 'WEATHER_DISPLAY.CONTROLS.FEELS_LIKE' },
  { key: 'highC', labelKey: 'WEATHER_DISPLAY.CONTROLS.HIGH' },
  { key: 'lowC', labelKey: 'WEATHER_DISPLAY.CONTROLS.LOW' },
  { key: 'humidityPercent', labelKey: 'WEATHER_DISPLAY.CONTROLS.HUMIDITY' },
  { key: 'windSpeedKph', labelKey: 'WEATHER_DISPLAY.CONTROLS.WIND' },
] as const;

const fetchLiveWeather = (): Promise<DemoWeather | null> =>
  fetchOpenMeteoSnapshot(DEFAULT_LOCATION, HOURLY_COUNT, DAILY_COUNT)
    .then(({ current, daily }) => {
      const today = daily[TODAY_INDEX];
      return today
        ? {
            temperatureC: current.temperatureC,
            feelsLikeC: current.feelsLikeC,
            highC: today.tempMaxC,
            lowC: today.tempMinC,
            humidityPercent: current.humidityPercent,
            windSpeedKph: current.windSpeedKph,
            condition: current.condition,
            isDay: current.isDay,
          }
        : null;
    })
    .catch(() => null);

const WeatherDisplayDemoContent = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<FetchStatus>(FETCH_STATUS.LOADING);
  const [city, setCity] = useState(t('WEATHER_DISPLAY.DEFAULT_CITY'));
  const [weather, setWeather] = useState<DemoWeather>(FALLBACK_WEATHER);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [badges, setBadges] = useState<PreparationBadge[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLiveWeather().then(live => {
      if (cancelled) return;
      if (live) setWeather(live);
      setStatus(live ? FETCH_STATUS.LIVE : FETCH_STATUS.FALLBACK);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateWeather = (patch: Partial<DemoWeather>) =>
    setWeather(previous => ({ ...previous, ...patch }));

  const toggleBadge = (badge: PreparationBadge, checked: boolean) =>
    setBadges(previous =>
      checked
        ? PREPARATION_BADGES.filter(
            key => key === badge || previous.includes(key),
          )
        : previous.filter(key => key !== badge),
    );

  const unit = isFahrenheit
    ? TEMPERATURE_UNIT.FAHRENHEIT
    : TEMPERATURE_UNIT.CELSIUS;
  const formatTemperature = (celsius: number) =>
    toDisplayTemperature(celsius, unit);

  const renderSwitch = (
    label: string,
    checked: boolean,
    onCheckedChange: (checked: boolean) => void,
  ) => (
    <label
      key={label}
      className="flex items-center gap-2 text-sm cursor-pointer"
    >
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <Text size="2" color="gray">
        {status === FETCH_STATUS.LIVE
          ? t('WEATHER_DISPLAY.STATUS.LIVE', { city })
          : t(`WEATHER_DISPLAY.STATUS.${status}`)}
      </Text>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <label className="flex flex-col gap-1 text-sm">
            {t('WEATHER_DISPLAY.CONTROLS.CITY')}
            <Input
              value={city}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setCity(event.target.value)
              }
            />
          </label>
          {TEMPERATURE_FIELDS.map(({ key, labelKey }) => (
            <label key={key} className="flex flex-col gap-1 text-sm">
              {t(labelKey)}
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

        <div className="flex flex-col gap-1 text-sm">
          {t('WEATHER_DISPLAY.CONTROLS.CONDITION')}
          <SegmentedControl
            label={t('WEATHER_DISPLAY.CONTROLS.CONDITION')}
            value={weather.condition}
            onChange={condition => updateWeather({ condition })}
            className="flex-wrap"
            options={WEATHER_CONDITIONS.map(condition => ({
              value: condition,
              label: t(`WEATHER_DISPLAY.CONDITION.${condition}`),
              icon: (
                <span aria-hidden>
                  {getWeatherIcon(condition, weather.isDay)}
                </span>
              ),
            }))}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {renderSwitch(
            t('WEATHER_DISPLAY.CONTROLS.DAY'),
            weather.isDay,
            isDay => updateWeather({ isDay }),
          )}
          {renderSwitch(
            t('WEATHER_DISPLAY.CONTROLS.FAHRENHEIT'),
            isFahrenheit,
            setIsFahrenheit,
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {t('WEATHER_DISPLAY.CONTROLS.BADGES')}
          <div className="flex flex-wrap gap-4">
            {PREPARATION_BADGES.map(badge =>
              renderSwitch(
                t(`WEATHER_DISPLAY.PREPARATION.${badge}`),
                badges.includes(badge),
                checked => toggleBadge(badge, checked),
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center rounded-lg bg-gradient-to-b from-sky-50 to-white px-6 py-12 text-gray-900 dark:from-slate-900 dark:to-slate-950 dark:text-gray-100">
        <WeatherCard>
          <WeatherDisplay
            city={city}
            condition={weather.condition}
            isDay={weather.isDay}
            current={t('WEATHER_DISPLAY.WEATHER.CURRENT', {
              temperature: formatTemperature(weather.temperatureC),
              condition: t(`WEATHER_DISPLAY.CONDITION.${weather.condition}`),
            })}
            high={t('WEATHER_DISPLAY.WEATHER.HIGH', {
              temperature: formatTemperature(weather.highC),
            })}
            low={t('WEATHER_DISPLAY.WEATHER.LOW', {
              temperature: formatTemperature(weather.lowC),
            })}
            feelsLike={t('WEATHER_DISPLAY.WEATHER.FEELS_LIKE', {
              temperature: formatTemperature(weather.feelsLikeC),
            })}
            humidity={t('WEATHER_DISPLAY.WEATHER.HUMIDITY', {
              percent: Math.round(weather.humidityPercent),
            })}
            wind={t('WEATHER_DISPLAY.WEATHER.WIND', {
              speed: Math.round(weather.windSpeedKph),
            })}
            badges={badges.map(badge => ({
              key: badge,
              icon: PREPARATION_BADGE[badge],
              label: t(`WEATHER_DISPLAY.PREPARATION.${badge}`),
            }))}
          />
        </WeatherCard>
      </div>
    </div>
  );
};

export const WeatherDisplayDemo = () => (
  <I18nProvider>
    <WeatherDisplayDemoContent />
  </I18nProvider>
);
