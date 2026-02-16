export type AppConfig = {
  id?: string;
  APP_NAME: string;
  OFFICES: string[];
};

export const PRESENCE_TIME = {
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
