import { LANGUAGE } from '../consts/app-copy.const';
import {
  DEMO_OFFICES,
  DEMO_USERS,
  DEMO_USER_ID_PREFIX,
} from '../consts/demo-users.const';
import { PRESENCE_TIME, UserPresence } from '../types';
import {
  formatISODateInTimeZone,
  getISOWeekday,
  getWeekDates,
  getWeekStart,
} from '../utils/date.utils';
import {
  deleteSeededRows,
  deleteSeededRowsBefore,
  deleteSeededRowsOfOtherUsers,
  deleteSeededSettings,
  hasSeededRows,
  runInTransaction,
  saveEvent,
  savePresence,
  savePresenceIfMissing,
  saveUserSettings,
} from '../utils/db.utils';

export type SeedOptions = {
  timeZone: string;
  includeWeekends?: boolean;
  // Also (re)seed the week containing today, not just the coming one.
  includeCurrentWeek?: boolean;
  // Real members that get presences too; their existing entries are never touched.
  realUserIds?: string[];
  now?: Date;
};

export type SeedResult = {
  days: string[];
  prunedBefore: string;
  presences: number;
  events: number;
};

const ISO_WEEKDAY = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

const demoId = (name: string) => `${DEMO_USER_ID_PREFIX}${name}`;
const homeOfficeOf = (userId: string) =>
  DEMO_USERS.find(user => user.id === userId)?.homeOffice;

type SeededVisit = Omit<UserPresence, 'office'> & {
  name: string;
  office?: string;
};

// Kept small (1-3 people a day, few notes) so a visitor can follow what the app shows.
// The same week repeats, so every run produces the same rows.
const WEEKLY_VISITS: Record<number, SeededVisit[]> = {
  [ISO_WEEKDAY.MONDAY]: [
    { name: 'ASTRID', presenceTime: PRESENCE_TIME.WHOLE_DAY },
    { name: 'MATEO', presenceTime: PRESENCE_TIME.MORNING },
  ],
  [ISO_WEEKDAY.TUESDAY]: [
    {
      name: 'PRIYA',
      presenceTime: PRESENCE_TIME.WHOLE_DAY,
      isBringingDog: true,
      message: 'Come find me for coffee ☕',
    },
  ],
  [ISO_WEEKDAY.WEDNESDAY]: [
    { name: 'ASTRID', presenceTime: PRESENCE_TIME.WHOLE_DAY },
    { name: 'PRIYA', presenceTime: PRESENCE_TIME.AFTERNOON },
    {
      name: 'LUCAS',
      office: 'Stockholm',
      presenceTime: PRESENCE_TIME.WHOLE_DAY,
      message: 'Visiting from Paris for the team lunch',
    },
  ],
  [ISO_WEEKDAY.THURSDAY]: [
    { name: 'MATEO', presenceTime: PRESENCE_TIME.WHOLE_DAY },
    { name: 'EBBA', presenceTime: PRESENCE_TIME.AFTERNOON },
  ],
  [ISO_WEEKDAY.FRIDAY]: [
    { name: 'ASTRID', presenceTime: PRESENCE_TIME.MORNING },
    { name: 'MATEO', presenceTime: PRESENCE_TIME.WHOLE_DAY },
    { name: 'EBBA', presenceTime: PRESENCE_TIME.WHOLE_DAY },
  ],
  [ISO_WEEKDAY.SATURDAY]: [
    { name: 'LUCAS', presenceTime: PRESENCE_TIME.MORNING },
  ],
  [ISO_WEEKDAY.SUNDAY]: [
    { name: 'EBBA', presenceTime: PRESENCE_TIME.UNDECIDED },
  ],
};

// One event per weekday, and attendees are already in that day's visits, so events
// never share a day and never add people to it.
const EVENTS = [
  {
    name: 'Team lunch at Tre Kronor',
    weekday: ISO_WEEKDAY.WEDNESDAY,
    time: '12:00',
    creatorId: demoId('ASTRID'),
    description: 'Booked a long table, vegetarian options available',
    attendees: ['ASTRID', 'PRIYA', 'LUCAS'],
  },
  {
    name: 'Demo Friday',
    weekday: ISO_WEEKDAY.FRIDAY,
    time: '15:30',
    creatorId: demoId('MATEO'),
    description: 'Each squad shows one thing they shipped this sprint',
    attendees: ['MATEO', 'ASTRID', 'EBBA'],
  },
];

// Real members, if configured, drop in on a couple of days a week.
const isRealMemberInOffice = (userIndex: number, weekday: number) =>
  (userIndex + weekday) % 3 === 0;

const seedPresences = (days: string[]) => {
  let count = 0;
  days.forEach(day => {
    WEEKLY_VISITS[getISOWeekday(day)].forEach(({ name, office, ...visit }) => {
      const userId = demoId(name);
      savePresence(userId, day, {
        ...visit,
        office: office ?? homeOfficeOf(userId),
      });
      count++;
    });
  });
  return count;
};

// The first matching day still ahead of today, so an event is not seeded into the past.
const findEventDate = (days: string[], weekday: number, todayISO: string) => {
  const matching = days.filter(day => getISOWeekday(day) === weekday);
  return matching.find(day => day >= todayISO) ?? matching[0];
};

const seedEvents = (days: string[], todayISO: string) => {
  let count = 0;
  EVENTS.forEach(({ weekday, attendees, ...event }) => {
    const date = findEventDate(days, weekday, todayISO);
    if (!date) return;
    const attendeeIds = attendees.map(demoId);
    saveEvent({ ...event, date, attendees: attendeeIds });
    attendeeIds.forEach(userId =>
      savePresenceIfMissing(userId, date, {
        office: homeOfficeOf(userId),
        presenceTime: PRESENCE_TIME.WHOLE_DAY,
      }),
    );
    count++;
  });
  return count;
};

const seedSettings = () => {
  DEMO_USERS.forEach(user => {
    saveUserSettings(user.id, {
      defaultOffice: user.homeOffice,
      language: user.id === demoId('EBBA') ? LANGUAGE.SV : undefined,
    });
  });
};

const seedRealMembers = (
  realUserIds: string[],
  days: string[],
  homeOffice: string,
) => {
  realUserIds.forEach((userId, userIndex) => {
    days.forEach(day => {
      if (!isRealMemberInOffice(userIndex, getISOWeekday(day))) return;
      savePresenceIfMissing(userId, day, {
        office: homeOffice,
        presenceTime: PRESENCE_TIME.WHOLE_DAY,
      });
    });
  });
};

// Idempotent: seeded rows (reserved id prefix) in the target weeks are replaced and older ones pruned.
// Rows owned by real members are only ever added to, never deleted or overwritten.
export function seedDemoData({
  timeZone,
  includeWeekends,
  includeCurrentWeek,
  realUserIds = [],
  now = new Date(),
}: SeedOptions): SeedResult {
  const todayISO = formatISODateInTimeZone(now, timeZone);
  const weekOffsets = includeCurrentWeek ? [0, 1] : [1];
  const days = weekOffsets.flatMap(offset =>
    getWeekDates(todayISO, offset, includeWeekends),
  );
  const prunedBefore = getWeekStart(todayISO);

  return runInTransaction(() => {
    deleteSeededRowsBefore(DEMO_USER_ID_PREFIX, prunedBefore);
    deleteSeededRows(DEMO_USER_ID_PREFIX, days[0], days[days.length - 1]);
    deleteSeededRowsOfOtherUsers(
      DEMO_USER_ID_PREFIX,
      DEMO_USERS.map(user => user.id),
    );
    deleteSeededSettings(DEMO_USER_ID_PREFIX);
    const presences = seedPresences(days);
    const events = seedEvents(days, todayISO);
    seedSettings();
    seedRealMembers(realUserIds, days, DEMO_OFFICES[0]);
    return { days, prunedBefore, presences, events };
  });
}

// First boot on an empty volume: show a populated demo before the weekly seed job has run.
export function seedDemoDataIfEmpty(options: SeedOptions) {
  if (hasSeededRows(DEMO_USER_ID_PREFIX)) return null;
  return seedDemoData({ ...options, includeCurrentWeek: true });
}
