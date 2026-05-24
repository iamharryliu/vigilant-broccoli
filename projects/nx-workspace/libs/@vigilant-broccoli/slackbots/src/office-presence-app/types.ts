import { AppCopy } from './consts/app-copy.const';

export type AppConfig = {
  APP_NAME: string;
  OFFICES: string[];
  includeWeekends?: boolean;
  daysAhead?: number;
  defaultShowWeekdaysOnly: boolean;
  defaultShowTeamCount: boolean;
  defaultWeeksAhead: number;
  copy: AppCopy;
};

export const PRESENCE_TIME = {
  UNDECIDED: 'undecided',
  WHOLE_DAY: 'whole day',
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
} as const;

export type UserPresences = Record<string, Record<string, UserPresence>>;

export type UserPresence = {
  office?: string;
  presenceTime?: string;
  isBringingDog?: boolean;
  message?: string;
};

export type UserPresenceRow = {
  user_id: string;
  date: string;
  office?: string;
  presence_time?: string;
  is_bringing_dog?: number;
  message?: string;
};

export type OfficeEvent = {
  id?: number;
  name: string;
  date: string;
  time: string;
  creatorId: string;
  description?: string;
  attendees?: string[];
};

export type OfficeEventRow = {
  id: number;
  name: string;
  date: string;
  time: string;
  creator_id: string;
  description?: string;
  attendees?: string;
};

export type UserSettings = {
  defaultOffice?: string;
  showWeekdaysOnly?: boolean;
  showTeamCount?: boolean;
  weeksAhead?: number;
};

export type UserSettingsRow = {
  user_id: string;
  default_office?: string;
  show_weekdays_only?: number;
  show_team_count?: number;
  weeks_ahead?: number;
};
