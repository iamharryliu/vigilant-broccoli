'use client';

import { WeatherCard } from '../WeatherDisplay';
import { LocalWeatherFailure, LOCAL_WEATHER_STATUS } from './useLocalWeather';
import { useTranslation, WeatherI18nProvider } from './weather.i18n';
import { Button } from '@vigilant-broccoli/react-lib';

const LOCATION_ICON = '📍';
const ERROR_ICON = '🌥️';

const FAILURE_VIEW = {
  [LOCAL_WEATHER_STATUS.LOCATION_DENIED]: {
    icon: LOCATION_ICON,
    titleKey: 'LOCATION.DENIED_TITLE',
    messageKey: 'LOCATION.DENIED_MESSAGE',
  },
  [LOCAL_WEATHER_STATUS.LOCATION_UNAVAILABLE]: {
    icon: LOCATION_ICON,
    titleKey: 'LOCATION.UNAVAILABLE_TITLE',
    messageKey: 'LOCATION.UNAVAILABLE_MESSAGE',
  },
  [LOCAL_WEATHER_STATUS.WEATHER_ERROR]: {
    icon: ERROR_ICON,
    titleKey: 'WEATHER.ERROR_TITLE',
    messageKey: 'WEATHER.ERROR_MESSAGE',
  },
} as const;

export interface LocalWeatherMessageProps {
  failure: LocalWeatherFailure;
  onRetry?: () => void;
}

const LocalWeatherMessageContent = ({
  failure,
  onRetry,
}: LocalWeatherMessageProps) => {
  const { t } = useTranslation();
  const { icon, titleKey, messageKey } = FAILURE_VIEW[failure];

  return (
    <WeatherCard className="max-w-none px-4 py-6">
      <div className="flex flex-col items-center gap-3" role="alert">
        <span className="text-4xl" aria-hidden>
          {icon}
        </span>
        <h2 className="text-base font-semibold">{t(titleKey)}</h2>
        <p className="text-sm text-muted-foreground">{t(messageKey)}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="mt-2 bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            {t('ACTIONS.RETRY')}
          </Button>
        )}
      </div>
    </WeatherCard>
  );
};

export const LocalWeatherMessage = (props: LocalWeatherMessageProps) => (
  <WeatherI18nProvider>
    <LocalWeatherMessageContent {...props} />
  </WeatherI18nProvider>
);
