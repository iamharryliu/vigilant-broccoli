import { LANGUAGE } from '../consts/app-copy.const';
import {
  DEMO_OFFICES,
  DEMO_USERS,
  DEMO_USER_ID_PREFIX,
} from '../consts/demo-users.const';
import { PRESENCE_TIME, UserPresence } from '../types';
import {
  formatISODateInTimeZone,
  getWeekDates,
  getWeekStart,
} from '../utils/date.utils';
import {
  deleteSeededRows,
  deleteSeededRowsBefore,
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

const NOTES = [
  'Bringing surdeg!',
  'Pairing on the release all morning',
  'Leaving at 3 for a dentist appointment',
  'Come find me for coffee ☕',
  'Heads-down day, ping me on Slack',
  'Hosting the candidate interviews',
];
const PRESENCE_TIMES = [
  PRESENCE_TIME.WHOLE_DAY,
  PRESENCE_TIME.WHOLE_DAY,
  PRESENCE_TIME.WHOLE_DAY,
  PRESENCE_TIME.MORNING,
  PRESENCE_TIME.AFTERNOON,
  PRESENCE_TIME.UNDECIDED,
];
const demoId = (name: string) => `${DEMO_USER_ID_PREFIX}${name}`;
const DOG_OWNERS = new Set([demoId('PRIYA'), demoId('NOAH')]);

// Deterministic so the seeded week looks the same on every run.
const isInOffice = (
  userIndex: number,
  dayIndex: number,
  isFirstVisibleDay: boolean,
) => isFirstVisibleDay || (userIndex * 3 + dayIndex * 5) % 7 < 4;

const buildPresence = (
  userId: string,
  homeOffice: string,
  userIndex: number,
  dayIndex: number,
): UserPresence => {
  const visitsOtherOffice = (userIndex + dayIndex) % 9 === 0;
  const office = visitsOtherOffice
    ? DEMO_OFFICES[(DEMO_OFFICES.indexOf(homeOffice) + 1) % DEMO_OFFICES.length]
    : homeOffice;
  const hasNote = (userIndex + dayIndex * 2) % 6 === 0;
  return {
    office,
    presenceTime:
      PRESENCE_TIMES[(userIndex + dayIndex) % PRESENCE_TIMES.length],
    isBringingDog: DOG_OWNERS.has(userId) && dayIndex % 2 === 0,
    message: hasNote ? NOTES[(userIndex + dayIndex) % NOTES.length] : undefined,
  };
};

const EVENTS = [
  {
    name: 'Team lunch at Tre Kronor',
    dayIndex: 1,
    time: '12:00',
    creatorId: demoId('ASTRID'),
    description: 'Booked a long table, vegetarian options available',
    attendees: ['ASTRID', 'PRIYA', 'EBBA', 'MATEO'],
  },
  {
    name: 'Demo Friday',
    dayIndex: 3,
    time: '15:30',
    creatorId: demoId('KENJI'),
    description: 'Each squad shows one thing they shipped this sprint',
    attendees: ['KENJI', 'MATEO', 'LUCAS', 'HANNA', 'NOAH'],
  },
  {
    name: 'Board games night',
    dayIndex: 4,
    time: '18:00',
    creatorId: demoId('SOFIA'),
    description: 'Pizza on the company, bring your favourite game',
    attendees: ['SOFIA', 'FELIX', 'LUCAS'],
  },
  {
    name: 'New joiner coffee',
    dayIndex: 6,
    time: '10:00',
    creatorId: demoId('SOFIA'),
    description: 'Meet the new hires from the Paris and New York offices',
    attendees: ['SOFIA', 'OLIVER', 'AMARA'],
  },
];

const seedPresences = (days: string[], firstVisibleDay: string) => {
  let count = 0;
  DEMO_USERS.forEach((user, userIndex) => {
    days.forEach((day, dayIndex) => {
      const isFirstVisibleDay = day === firstVisibleDay && userIndex < 8;
      if (!isInOffice(userIndex, dayIndex, isFirstVisibleDay)) return;
      savePresence(
        user.id,
        day,
        buildPresence(user.id, user.homeOffice, userIndex, dayIndex),
      );
      count++;
    });
  });
  return count;
};

const seedEvents = (days: string[]) => {
  EVENTS.forEach(({ dayIndex, attendees, ...event }) => {
    const date = days[dayIndex % days.length];
    const attendeeIds = attendees.map(demoId);
    saveEvent({ ...event, date, attendees: attendeeIds });
    attendeeIds.forEach(userId =>
      savePresenceIfMissing(userId, date, {
        presenceTime: PRESENCE_TIME.WHOLE_DAY,
      }),
    );
  });
  return EVENTS.length;
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
    days.forEach((day, dayIndex) => {
      if (!isInOffice(userIndex + 3, dayIndex, false)) return;
      savePresenceIfMissing(
        userId,
        day,
        buildPresence(userId, homeOffice, userIndex + 3, dayIndex),
      );
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
  const firstVisibleDay = days.find(day => day >= todayISO) ?? days[0];

  return runInTransaction(() => {
    deleteSeededRowsBefore(DEMO_USER_ID_PREFIX, prunedBefore);
    deleteSeededRows(DEMO_USER_ID_PREFIX, days[0], days[days.length - 1]);
    deleteSeededSettings(DEMO_USER_ID_PREFIX);
    const presences = seedPresences(days, firstVisibleDay);
    const events = seedEvents(days);
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
