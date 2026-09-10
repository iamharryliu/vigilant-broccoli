'use client';

import { useEffect, useState } from 'react';
import { ClockComponent } from './clock.component';
import {
  useWeather,
  getWeatherIcon,
  getOrderedSunEvents,
  formatSunTime,
} from '../hooks/useWeather';
import { Skeleton } from '@vigilant-broccoli/react-lib';
import { WeatherDialog } from './weather-dialog.component';

const CLOCK_TIME_SIZE = '6';

const SUN_TICK_MS = 60 * 1000;

const DIVIDER_STYLE = {
  width: '1px',
  height: '60px',
  backgroundColor: 'var(--gray-6)',
} as const;

export const DashboardInfoCard = () => {
  const { weatherData, loading: weatherLoading } = useWeather();
  const [weatherDialogOpen, setWeatherDialogOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), SUN_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1.5rem',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor:
            'color-mix(in srgb, var(--color-background) 50%, transparent)',
          borderRadius: '0.75rem',
          border: '1px solid var(--gray-6)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="time" timeSize={CLOCK_TIME_SIZE} />
        </div>

        <div style={DIVIDER_STYLE} />

        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="info" />
        </div>

        <div style={DIVIDER_STYLE} />

        <div
          onClick={() => !weatherLoading && setWeatherDialogOpen(true)}
          style={{
            width: '5rem',
            cursor: weatherLoading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!weatherLoading) e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
          }}
          title="Weather"
        >
          {weatherLoading || !weatherData[0] ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
              }}
            >
              <Skeleton className="h-6 w-6 rounded-full" />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  flex: 1,
                }}
              >
                <Skeleton className="h-3.5 w-10" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '1.5rem' }}>
                {getWeatherIcon(weatherData[0].now.icon)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {weatherData[0].now.temp}&deg;C
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-9)' }}>
                  {weatherData[0].city}
                </span>
              </div>
            </>
          )}
        </div>

        <div style={DIVIDER_STYLE} />

        <div
          style={{
            minWidth: 'max-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          {weatherLoading || !weatherData[0] ? (
            <>
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-24" />
            </>
          ) : (
            getOrderedSunEvents(weatherData[0].sun, nowMs).map(event => (
              <span
                key={event.label}
                style={{
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{event.icon}</span>
                <span style={{ color: 'var(--gray-9)' }}>{event.label}</span>
                <span style={{ fontWeight: 600 }}>
                  {formatSunTime(event.ts, weatherData[0].timezone)}
                </span>
              </span>
            ))
          )}
        </div>
      </div>
      <WeatherDialog
        open={weatherDialogOpen}
        onOpenChange={setWeatherDialogOpen}
      />
    </>
  );
};
