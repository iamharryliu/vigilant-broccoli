'use client';

import { useEffect, useRef, useState } from 'react';
import {
  isWeatherEmbedMessage,
  WEATHER_EMBED,
  WeatherEmbedAppearance,
  WeatherEmbedMessage,
} from '@vigilant-broccoli/common-js';
import {
  Button,
  cn,
  Skeleton,
  Text,
  useTheme,
} from '@vigilant-broccoli/react-lib';

// weather-next owns geolocation, fetching and the card; this only embeds it.
const WEATHER_TITLE = 'Weather';
const READY_TIMEOUT_MS = 15_000;

const postThemeToFrame = (
  frame: HTMLIFrameElement | null,
  appearance: WeatherEmbedAppearance,
  weatherOrigin: string,
) => {
  const message: WeatherEmbedMessage = {
    type: WEATHER_EMBED.MESSAGE.THEME,
    appearance,
  };
  frame?.contentWindow?.postMessage(message, weatherOrigin);
};

// Staging weather-next sits behind Vercel Authentication, so callers embed the
// custom domain unless a local weather-next is pointed at.
export const WeatherEmbedCard = ({ weatherUrl }: { weatherUrl: string }) => {
  const weatherOrigin = new URL(weatherUrl).origin;
  const embedSrc = new URL(WEATHER_EMBED.PATH, weatherUrl).toString();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isReadyRef = useRef(false);
  const { appearance } = useTheme();
  const appearanceRef = useRef(appearance);
  const [height, setHeight] = useState<number | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== weatherOrigin ||
        event.source !== frameRef.current?.contentWindow ||
        !isWeatherEmbedMessage(event.data)
      )
        return;
      if (event.data.type === WEATHER_EMBED.MESSAGE.READY) {
        isReadyRef.current = true;
        postThemeToFrame(
          frameRef.current,
          appearanceRef.current,
          weatherOrigin,
        );
      } else if (event.data.type === WEATHER_EMBED.MESSAGE.HEIGHT) {
        setHeight(event.data.height);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [weatherOrigin]);

  useEffect(() => {
    appearanceRef.current = appearance;
    if (isReadyRef.current)
      postThemeToFrame(frameRef.current, appearance, weatherOrigin);
  }, [appearance, weatherOrigin]);

  useEffect(() => {
    if (height !== null) return;
    const timeout = setTimeout(() => setHasFailed(true), READY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [height, attempt]);

  const retry = () => {
    isReadyRef.current = false;
    setHeight(null);
    setHasFailed(false);
    setAttempt(previous => previous + 1);
  };

  const isShown = height !== null;

  return (
    <div className="relative shrink-0">
      {!isShown && !hasFailed && (
        <Skeleton className="h-40 w-full rounded-xl" />
      )}
      {!isShown && hasFailed && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border p-4">
          <Text color="gray">
            Weather did not load.{' '}
            <a
              href={weatherUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open {WEATHER_TITLE}
            </a>
          </Text>
          <Button size="sm" variant="outline" onClick={retry}>
            Retry
          </Button>
        </div>
      )}
      {/* Transparent over the placeholder rather than hidden or zero-sized:
          Chrome throttles invisible cross-origin frames, which would delay the
          height report, and the card must measure at the real width. */}
      <iframe
        key={attempt}
        ref={frameRef}
        src={embedSrc}
        title={WEATHER_TITLE}
        allow="geolocation"
        className={cn(
          'block w-full border-0',
          !isShown && 'pointer-events-none absolute inset-0 h-full opacity-0',
        )}
        style={isShown ? { height } : undefined}
      />
    </div>
  );
};
