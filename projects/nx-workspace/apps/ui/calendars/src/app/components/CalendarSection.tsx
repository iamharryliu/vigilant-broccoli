'use client';

import { ReactNode } from 'react';
import { CALENDAR_SECTION_STATE } from '../../lib/calendars.consts';
import { CalendarLink, CalendarSectionState } from '../../lib/calendars.types';
import { useTranslation } from '../i18n';
import { CalendarRow } from './CalendarRow';

const STATUS_MESSAGE_KEY = {
  [CALENDAR_SECTION_STATE.LOADING]: 'STATUS.LOADING',
  [CALENDAR_SECTION_STATE.ERROR]: 'STATUS.ERROR',
} as const;

export const CalendarSection = ({
  headingKey,
  headingId,
  state = CALENDAR_SECTION_STATE.READY,
  calendars = [],
}: {
  headingKey: 'SECTION.PERSONAL' | 'SECTION.EVENT';
  headingId: string;
  state?: CalendarSectionState;
  calendars?: CalendarLink[];
}) => {
  const { t } = useTranslation();

  const body: ReactNode =
    state === CALENDAR_SECTION_STATE.READY ? (
      calendars.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('STATUS.EMPTY')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {calendars.map(calendar => (
            <CalendarRow key={calendar.id} calendar={calendar} />
          ))}
        </ul>
      )
    ) : (
      <p
        role={state === CALENDAR_SECTION_STATE.ERROR ? 'alert' : 'status'}
        className={
          state === CALENDAR_SECTION_STATE.ERROR
            ? 'text-sm text-red-600 dark:text-red-400'
            : 'text-sm text-gray-500 dark:text-gray-400'
        }
      >
        {t(STATUS_MESSAGE_KEY[state])}
      </p>
    );

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2
        id={headingId}
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        {t(headingKey)}
      </h2>
      {body}
    </section>
  );
};
