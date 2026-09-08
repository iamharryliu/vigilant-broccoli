export interface BirthdayPerson {
  email: string;
  firstName: string;
  lastName: string;
}

export interface EmployeeBirthday {
  id: string;
  employee: BirthdayPerson;
  /** ISO date (YYYY-MM-DD). Only the month/day recur; the year is kept so
   *  targets can show "turns N" in the event title. */
  birthDate: string;
  /** Going inactive is treated as terminal, same as a leave's denied/cancelled
   *  status — the birthday is removed from every target once false. */
  active: boolean;
}

export interface SyncedBirthdaySnapshot {
  birthDate: string;
  employeeName: string;
}

export interface BirthdayTrackedTarget {
  externalId: string;
  externalParentId?: string;
  synced: SyncedBirthdaySnapshot;
}

export interface TrackedBirthday {
  birthdayId: string;
  birthday: EmployeeBirthday;
  targets: Record<string, BirthdayTrackedTarget>;
}

export const BIRTHDAY_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type BirthdayActionKind =
  (typeof BIRTHDAY_ACTION)[keyof typeof BIRTHDAY_ACTION];

export type BirthdayAction =
  | { kind: typeof BIRTHDAY_ACTION.CREATE; birthday: EmployeeBirthday }
  | {
      kind: typeof BIRTHDAY_ACTION.UPDATE;
      birthday: EmployeeBirthday;
      tracked: BirthdayTrackedTarget;
    }
  | {
      kind: typeof BIRTHDAY_ACTION.DELETE;
      birthday: EmployeeBirthday;
      tracked: BirthdayTrackedTarget;
    };

export interface BirthdayTarget {
  id: string;
  accepts?: (birthday: EmployeeBirthday) => boolean;
  apply: (action: BirthdayAction) => Promise<BirthdayTrackedTarget | null>;
  flush?: () => Promise<void>;
}

export interface BirthdayStore {
  getTracked: () => TrackedBirthday[];
  save: () => Promise<void>;
}

export interface BirthdaySyncUtilities {
  fetchBirthdays: () => Promise<EmployeeBirthday[]>;
  store: BirthdayStore;
  targets: BirthdayTarget[];
}
