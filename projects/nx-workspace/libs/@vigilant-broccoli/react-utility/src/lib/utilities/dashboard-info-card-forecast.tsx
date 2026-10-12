'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DATE_CONST,
  ForecastDay,
  toDisplayTemperature,
  WEATHER_CONDITION_LABEL,
} from '@vigilant-broccoli/common-js';
import { useWeatherTranslation } from '@vigilant-broccoli/react-lib';
import { weatherLucideIcon } from './dashboard-info-card-icons';

const SCROLL_STEP_RATIO = 0.8;
const EDGE_TOLERANCE_PX = 1;
const TODAY_INDEX = 0;
const MONTH_DAY_START = 5;
const FORECAST_ICON_SIZE = 28;
const NAV_ICON_SIZE = 18;
const NAV_BUTTON_CLASS =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-opacity hover:bg-accent disabled:cursor-default disabled:opacity-30 disabled:hover:bg-card';

const dayNameFromDate = (date: string): string =>
  DATE_CONST.DAY[new Date(`${date}T00:00:00`).getDay()];

interface ScrollEdges {
  atStart: boolean;
  atEnd: boolean;
}

const useScrollEdges = (itemCount: number) => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState<ScrollEdges>({
    atStart: true,
    atEnd: true,
  });

  const updateEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setEdges({
      atStart: scrollLeft <= EDGE_TOLERANCE_PX,
      atEnd: scrollLeft + clientWidth >= scrollWidth - EDGE_TOLERANCE_PX,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [updateEdges, itemCount]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * scroller.clientWidth * SCROLL_STEP_RATIO,
      behavior: 'smooth',
    });
  }, []);

  return { scrollerRef, edges, updateEdges, scrollByPage };
};

interface ForecastCarouselProps {
  id: string;
  forecast: ForecastDay[];
}

export const ForecastCarousel = ({ id, forecast }: ForecastCarouselProps) => {
  const { t } = useWeatherTranslation();
  const { scrollerRef, edges, updateEdges, scrollByPage } = useScrollEdges(
    forecast.length,
  );

  return (
    <div
      id={id}
      role="region"
      aria-label={t('FORECAST.LABEL')}
      className="flex w-full min-w-0 items-center gap-2"
    >
      <button
        type="button"
        className={NAV_BUTTON_CLASS}
        aria-label={t('FORECAST.PREVIOUS')}
        disabled={edges.atStart}
        onClick={() => scrollByPage(-1)}
      >
        <ChevronLeft size={NAV_ICON_SIZE} />
      </button>
      <ul
        ref={scrollerRef}
        tabIndex={0}
        onScroll={updateEdges}
        className="m-0 flex min-w-0 flex-1 snap-x snap-mandatory list-none gap-2 overflow-x-auto scroll-smooth p-0 pb-1"
      >
        {forecast.map(
          ({ date, highC, lowC, condition, precipitationSumMm }, index) => {
            const Icon = weatherLucideIcon(condition, true);
            const high = toDisplayTemperature(highC);
            const low = toDisplayTemperature(lowC);
            return (
              <li
                key={date}
                className="flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-lg border border-border bg-muted px-1 py-2 text-center"
                title={WEATHER_CONDITION_LABEL[condition]}
              >
                <span className="text-xs font-semibold">
                  {index === TODAY_INDEX
                    ? t('FORECAST.TODAY')
                    : dayNameFromDate(date)}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {date.slice(MONTH_DAY_START)}
                </span>
                <Icon
                  size={FORECAST_ICON_SIZE}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span
                  className="text-xs font-semibold"
                  aria-label={t('FORECAST.RANGE', { high, low })}
                >
                  {high}° <span className="text-muted-foreground">{low}°</span>
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {t('FORECAST.PRECIPITATION', {
                    amount: Math.round(precipitationSumMm * 10) / 10,
                  })}
                </span>
              </li>
            );
          },
        )}
      </ul>
      <button
        type="button"
        className={NAV_BUTTON_CLASS}
        aria-label={t('FORECAST.NEXT')}
        disabled={edges.atEnd}
        onClick={() => scrollByPage(1)}
      >
        <ChevronRight size={NAV_ICON_SIZE} />
      </button>
    </div>
  );
};
