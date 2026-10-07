import { ReactNode } from 'react';
import { getWeatherIcon, WeatherCondition } from '@vigilant-broccoli/common-js';
import { Card } from './Card';
import { cn } from '../utils/cn';

const SEPARATOR = '·';

const WEATHER_CARD_CLASS =
  'w-full max-w-sm px-8 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60';

export interface WeatherDisplayBadge {
  key: string;
  icon: string;
  label: string;
}

export interface WeatherDisplayProps {
  city: string;
  condition: WeatherCondition;
  isDay: boolean;
  current: string;
  high: string;
  low: string;
  feelsLike: string;
  humidity: string;
  wind: string;
  badges?: WeatherDisplayBadge[];
}

export const WeatherCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <Card className={cn(WEATHER_CARD_CLASS, className)}>{children}</Card>;

export const WeatherDisplay = ({
  city,
  condition,
  isDay,
  current,
  high,
  low,
  feelsLike,
  humidity,
  wind,
  badges = [],
}: WeatherDisplayProps) => (
  <div className="flex flex-col items-center gap-2">
    <h1 className="text-xl font-medium">{city}</h1>
    <span className="my-2 text-7xl leading-none" aria-hidden>
      {getWeatherIcon(condition, isDay)}
    </span>
    <p className="text-4xl font-light tracking-tight">{current}</p>
    <p className="text-base text-gray-700 dark:text-gray-300">
      {high} <span aria-hidden>{SEPARATOR}</span> {low}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{feelsLike}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {humidity} <span aria-hidden>{SEPARATOR}</span> {wind}
    </p>
    {badges.length > 0 && (
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {badges.map(({ key, icon, label }) => (
          <li
            key={key}
            className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-900 dark:bg-sky-900/40 dark:text-sky-100"
          >
            <span aria-hidden>{icon}</span>
            {label}
          </li>
        ))}
      </ul>
    )}
  </div>
);
