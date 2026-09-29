import { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n';

const CALENDAR_EMBED_URL = 'https://calendar.google.com/calendar/embed';
const CALENDAR_ID =
  'ZmU3OTU0MzJjMDlhYzNmMmE5ZDc4MDdkZGY1NjhkZGE3ZmZkY2I1YzNlZDdkZDA3OGNhNmE2OTNhNjVjNzdiN0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t';
const CALENDAR_TIMEZONE = 'America/Toronto';
const MOBILE_BREAKPOINT_PX = 768;
const CALENDAR_MODE = {
  AGENDA: 'AGENDA',
  MONTH: 'MONTH',
} as const;

const getModeForWidth = (width: number) =>
  width < MOBILE_BREAKPOINT_PX ? CALENDAR_MODE.AGENDA : CALENDAR_MODE.MONTH;

export function CalendarSection() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(() => getModeForWidth(window.innerWidth));

  useEffect(() => {
    const onResize = () => setMode(getModeForWidth(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const params = new URLSearchParams({
    wkst: '1',
    ctz: CALENDAR_TIMEZONE,
    title: t('CALENDAR.EMBED_TITLE'),
    src: CALENDAR_ID,
    mode,
  });

  return (
    <div className="lg:rounded-2xl lg:bg-white/70 lg:backdrop-blur-md lg:shadow-lg lg:p-10">
      <section className="mb-6 reveal-up hidden lg:block">
        <h2 className="mb-3 text-3xl font-bold lg:text-4xl">
          {t('CALENDAR.TITLE')}
        </h2>
        <p className="text-base leading-7 text-gray-700">
          {t('CALENDAR.DESCRIPTION')}
        </p>
      </section>
      <iframe
        src={`${CALENDAR_EMBED_URL}?${params}`}
        title={t('CALENDAR.EMBED_TITLE')}
        className="reveal-up reveal-up-delay-1 rounded-xl shadow-sm"
        style={{ border: 'solid 1px #777' }}
        width="100%"
        height="500"
        scrolling="no"
      />
    </div>
  );
}
