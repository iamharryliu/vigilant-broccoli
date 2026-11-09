'use client';

import { useEffect, useRef } from 'react';
import {
  isWeatherEmbedMessage,
  WEATHER_EMBED,
  WeatherEmbedMessage,
} from '@vigilant-broccoli/common-js';
import { LOCAL_MANAGER_ORIGINS } from '@vigilant-broccoli/infrastructure';
import { useTheme } from '@vigilant-broccoli/react-lib';
import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import { fetchWeather } from '../../lib/fetch-weather';

// ancestorOrigins is missing in Firefox, where the referrer still carries the
// embedding origin under the default referrer policy.
const getParentOrigin = (): string | null => {
  const origin =
    window.location.ancestorOrigins?.[0] ??
    (document.referrer ? new URL(document.referrer).origin : null);
  return origin && LOCAL_MANAGER_ORIGINS.includes(origin) ? origin : null;
};

export function WeatherEmbed() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { setPreference } = useTheme();

  useEffect(() => {
    const content = contentRef.current;
    const parentOrigin = window.parent === window ? null : getParentOrigin();
    if (!content || !parentOrigin) return;
    const post = (message: WeatherEmbedMessage) =>
      window.parent.postMessage(message, parentOrigin);
    // Height reporting starts after the first theme, so the parent reveals
    // the frame already in its appearance.
    const resizeObserver = new ResizeObserver(() =>
      post({
        type: WEATHER_EMBED.MESSAGE.HEIGHT,
        height: Math.ceil(content.getBoundingClientRect().height),
      }),
    );
    const onMessage = (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        event.origin !== parentOrigin ||
        !isWeatherEmbedMessage(event.data) ||
        event.data.type !== WEATHER_EMBED.MESSAGE.THEME
      )
        return;
      setPreference(event.data.appearance);
      resizeObserver.observe(content);
    };
    window.addEventListener('message', onMessage);
    post({ type: WEATHER_EMBED.MESSAGE.READY });
    return () => {
      window.removeEventListener('message', onMessage);
      resizeObserver.disconnect();
    };
  }, [setPreference]);

  return (
    <main className="text-gray-900 dark:text-gray-100">
      <div ref={contentRef}>
        <WeatherClockCardUtilityContent fetchWeather={fetchWeather} />
      </div>
    </main>
  );
}
