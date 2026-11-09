'use client';

import { useEffect, useRef, useState } from 'react';
import {
  isWeatherEmbedMessage,
  WEATHER_EMBED,
  WeatherEmbedAppearance,
  WeatherEmbedMessage,
} from '@vigilant-broccoli/common-js';
import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import {
  Button,
  cn,
  Skeleton,
  Text,
  useTheme,
} from '@vigilant-broccoli/react-lib';

// weather-next owns geolocation, fetching and the card; this only embeds it.
// Staging weather-next sits behind Vercel Authentication, so every environment
// embeds the custom domain unless a local weather-next is pointed at.
const WEATHER_URL =
  process.env.NEXT_PUBLIC_WEATHER_URL || VB_APP_URL.WEATHER.URL;
const WEATHER_ORIGIN = new URL(WEATHER_URL).origin;
const WEATHER_EMBED_SRC = new URL(WEATHER_EMBED.PATH, WEATHER_URL).toString();
const WEATHER_TITLE = 'Weather';
const READY_TIMEOUT_MS = 15_000;

const postThemeToFrame = (
  frame: HTMLIFrameElement | null,
  appearance: WeatherEmbedAppearance,
) => {
  const message: WeatherEmbedMessage = {
    type: WEATHER_EMBED.MESSAGE.THEME,
    appearance,
  };
  frame?.contentWindow?.postMessage(message, WEATHER_ORIGIN);
};

export const WeatherClockCard = () => {
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
        event.origin !== WEATHER_ORIGIN ||
        event.source !== frameRef.current?.contentWindow ||
        !isWeatherEmbedMessage(event.data)
      )
        return;
      if (event.data.type === WEATHER_EMBED.MESSAGE.READY) {
        isReadyRef.current = true;
        postThemeToFrame(frameRef.current, appearanceRef.current);
      } else if (event.data.type === WEATHER_EMBED.MESSAGE.HEIGHT) {
        setHeight(event.data.height);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    appearanceRef.current = appearance;
    if (isReadyRef.current) postThemeToFrame(frameRef.current, appearance);
  }, [appearance]);

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
              href={WEATHER_URL}
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
        src={WEATHER_EMBED_SRC}
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
