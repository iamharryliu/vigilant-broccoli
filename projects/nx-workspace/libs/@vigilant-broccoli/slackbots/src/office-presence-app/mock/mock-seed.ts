import { LANGUAGE } from '../consts/app-copy.const';
import { PRESENCE_TIME, UserPresence } from '../types';
import { formatISODateLocal, getUpcomingWeekdays } from '../utils/date.utils';
import {
  clearAllData,
  loadAllPresences,
  saveEvent,
  savePresence,
  saveUserSettings,
} from '../utils/db.utils';
import { MOCK_OFFICES, MOCK_USERS } from './mock-users.const';

const SEEDED_DAYS = 15;
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
const DOG_OWNERS = new Set(['U03PRIYA', 'U08NOAH']);

// Deterministic so the seeded week looks the same on every start.
const isInOffice = (
  userIndex: number,
  dayIndex: number,
  isTodayOrNext: boolean,
) => isTodayOrNext || (userIndex * 3 + dayIndex * 5) % 7 < 4;

const buildPresence = (
  userId: string,
  homeOffice: string,
  userIndex: number,
  dayIndex: number,
): UserPresence => {
  const visitsOtherOffice = (userIndex + dayIndex) % 9 === 0;
  const office = visitsOtherOffice
    ? MOCK_OFFICES[(MOCK_OFFICES.indexOf(homeOffice) + 1) % MOCK_OFFICES.length]
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

const seedPresences = (days: string[]) => {
  MOCK_USERS.forEach((user, userIndex) => {
    days.forEach((day, dayIndex) => {
      if (!isInOffice(userIndex, dayIndex, dayIndex === 0 && userIndex < 8)) {
        return;
      }
      savePresence(
        user.id,
        day,
        buildPresence(user.id, user.homeOffice, userIndex, dayIndex),
      );
    });
  });
};

const seedEvents = (days: string[]) => {
  const events = [
    {
      name: 'Team lunch at Tre Kronor',
      dayIndex: 1,
      time: '12:00',
      creatorId: 'U01ASTRID',
      description: 'Booked a long table, vegetarian options available',
      attendees: ['U01ASTRID', 'U03PRIYA', 'U09EBBA', 'U02MATEO'],
    },
    {
      name: 'Demo Friday',
      dayIndex: 3,
      time: '15:30',
      creatorId: 'U10KENJI',
      description: 'Each squad shows one thing they shipped this sprint',
      attendees: ['U10KENJI', 'U02MATEO', 'U04LUCAS', 'U05HANNA', 'U08NOAH'],
    },
    {
      name: 'Board games night',
      dayIndex: 4,
      time: '18:00',
      creatorId: 'U07SOFIA',
      description: 'Pizza on the company, bring your favourite game',
      attendees: ['U07SOFIA', 'U12FELIX', 'U04LUCAS'],
    },
    {
      name: 'New joiner coffee',
      dayIndex: 6,
      time: '10:00',
      creatorId: 'U07SOFIA',
      description: 'Meet the new hires from the Paris and New York offices',
      attendees: ['U07SOFIA', 'U06OLIVER', 'U11AMARA'],
    },
  ];
  const presences = loadAllPresences();
  events.forEach(({ dayIndex, attendees, ...event }) => {
    const date = days[Math.min(dayIndex, days.length - 1)];
    saveEvent({ ...event, date, attendees });
    attendees.forEach(userId => {
      if (!presences[userId]?.[date]) {
        savePresence(userId, date, { presenceTime: PRESENCE_TIME.WHOLE_DAY });
      }
    });
  });
};

const seedSettings = () => {
  MOCK_USERS.forEach(user => {
    saveUserSettings(user.id, {
      defaultOffice: user.homeOffice,
      language: user.id === 'U09EBBA' ? LANGUAGE.SV : undefined,
    });
  });
};

export function seedMockData() {
  clearAllData();
  const days = getUpcomingWeekdays(SEEDED_DAYS * 2)
    .map(formatISODateLocal)
    .slice(0, SEEDED_DAYS);
  seedPresences(days);
  seedEvents(days);
  seedSettings();
}
