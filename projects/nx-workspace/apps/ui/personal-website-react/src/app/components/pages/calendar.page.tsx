import { useEffect, useState } from 'react';
import {
  buildCalendarUrl,
  GOOGLE_CALENDAR,
  type CalendarConfig,
} from '@vigilant-broccoli/common-browser';
import { GeneralLayout } from '../layouts/general-layout';

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

const getModeForWidth = (width: number): CalendarConfig['mode'] => {
  if (width < MOBILE_BREAKPOINT) return 'AGENDA';
  if (width < TABLET_BREAKPOINT) return 'WEEK';
  return 'MONTH';
};

const BASE_CALENDAR_CONFIG: Omit<CalendarConfig, 'mode'> = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  title: 'Calendar',
  ownerCalendars: [
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
    },
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
    },
  ],
  sharedCalendars: [
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
    },
  ],
};

// Fill whatever the shell leaves over: below lg that is the fixed topbar, the
// shell's own 1rem offset under it, and this wrapper's 1.5rem bottom margin; at
// lg+ the topbar is gone and NavbarSection's 4rem row and 1px rule take its
// place, plus 1.5rem of margin above and below.
const CALENDAR_HEIGHT =
  'h-[calc(100dvh_-_var(--topbar-h)_-_2.5rem)] lg:h-[calc(100dvh_-_7rem_-_1px)]';

const CALENDAR_FRAME =
  'border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden min-h-[400px]';

export function CalendarPage() {
  const [mode, setMode] = useState<CalendarConfig['mode']>(() =>
    typeof window !== 'undefined'
      ? getModeForWidth(window.innerWidth)
      : 'MONTH',
  );

  useEffect(() => {
    const onResize = () => {
      const next = getModeForWidth(window.innerWidth);
      setMode(prev => (prev === next ? prev : next));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const url = buildCalendarUrl({ ...BASE_CALENDAR_CONFIG, mode });

  return (
    <GeneralLayout>
      <div className="w-11/12 mx-auto mb-6 lg:mt-6">
        <div className={`${CALENDAR_FRAME} ${CALENDAR_HEIGHT}`}>
          <iframe
            src={url}
            className="w-full h-full dark:invert dark:hue-rotate-180"
            title="Calendar"
          />
        </div>
      </div>
    </GeneralLayout>
  );
}
