'use client';

import { PointerEvent, useRef, useState } from 'react';
import {
  DATE_CONST,
  ForecastDay,
  toDisplayTemperature,
  WEATHER_CONDITION_LABEL,
} from '@vigilant-broccoli/common-js';
import { cn, useWeatherTranslation } from '@vigilant-broccoli/react-lib';
import { weatherLucideIcon } from './dashboard-info-card-icons';

const TODAY_INDEX = 0;
const MONTH_DAY_START = 5;
const FORECAST_ICON_SIZE = 28;
const MOUSE_POINTER = 'mouse';
const SCROLLER_CLASS =
  'm-0 flex min-w-0 w-full list-none gap-2 overflow-x-auto p-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const SCROLLER_IDLE_CLASS = 'cursor-grab snap-x snap-mandatory scroll-smooth';
const SCROLLER_DRAGGING_CLASS = 'cursor-grabbing select-none';

const dayNameFromDate = (date: string): string =>
  DATE_CONST.DAY[new Date(`${date}T00:00:00`).getDay()];

const useDragScroll = () => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (event: PointerEvent<HTMLUListElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller || event.pointerType !== MOUSE_POINTER) return;
    dragStart.current = { x: event.clientX, scrollLeft: scroller.scrollLeft };
    scroller.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const scroller = scrollerRef.current;
    if (!dragging || !scroller) return;
    scroller.scrollLeft =
      dragStart.current.scrollLeft - (event.clientX - dragStart.current.x);
  };

  const endDrag = () => setDragging(false);

  return {
    scrollerRef,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
};

interface ForecastCarouselProps {
  id: string;
  forecast: ForecastDay[];
}

export const ForecastCarousel = ({ id, forecast }: ForecastCarouselProps) => {
  const { t } = useWeatherTranslation();
  const { scrollerRef, dragging, handlers } = useDragScroll();

  return (
    <div
      id={id}
      role="region"
      aria-label={t('FORECAST.LABEL')}
      className="flex w-full min-w-0"
    >
      <ul
        ref={scrollerRef}
        tabIndex={0}
        {...handlers}
        className={cn(
          SCROLLER_CLASS,
          dragging ? SCROLLER_DRAGGING_CLASS : SCROLLER_IDLE_CLASS,
        )}
      >
        {forecast.map(
          ({ date, highC, lowC, condition, precipitationSumMm }, index) => {
            const Icon = weatherLucideIcon(condition, true);
            const high = toDisplayTemperature(highC);
            const low = toDisplayTemperature(lowC);
            return (
              <li
                key={date}
                className="flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-lg border border-[var(--gray-6)] bg-[var(--gray-3)] px-1 py-2 text-center"
                title={WEATHER_CONDITION_LABEL[condition]}
              >
                <span className="text-xs font-semibold">
                  {index === TODAY_INDEX
                    ? t('FORECAST.TODAY')
                    : dayNameFromDate(date)}
                </span>
                <span className="text-[0.65rem] text-[var(--gray-11)]">
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
                  {high}° <span className="text-[var(--gray-11)]">{low}°</span>
                </span>
                <span className="text-[0.65rem] text-[var(--gray-11)]">
                  {t('FORECAST.PRECIPITATION', {
                    amount: Math.round(precipitationSumMm * 10) / 10,
                  })}
                </span>
              </li>
            );
          },
        )}
      </ul>
    </div>
  );
};
