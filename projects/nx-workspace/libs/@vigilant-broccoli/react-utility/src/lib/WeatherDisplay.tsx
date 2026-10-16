import { ReactNode } from 'react';
import { Card, cn } from '@vigilant-broccoli/react-lib';

const WEATHER_CARD_CLASS =
  'w-full max-w-sm px-8 py-10 text-center shadow-sm border-border bg-card';

export interface WeatherDisplayBadge {
  key: string;
  icon: string;
  label: string;
}

export const WeatherCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <Card className={cn(WEATHER_CARD_CLASS, className)}>{children}</Card>;

export const WeatherBadgeList = ({
  badges,
  className,
}: {
  badges: WeatherDisplayBadge[];
  className?: string;
}) =>
  badges.length > 0 ? (
    <ul className={cn('flex flex-wrap justify-center gap-2', className)}>
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
  ) : null;
