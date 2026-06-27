export type AppCopy = typeof DEFAULT_APP_COPY;

export const LANGUAGE = {
  EN: 'en',
  SV: 'sv',
} as const;

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

export const DEFAULT_LANGUAGE: Language = LANGUAGE.EN;

export const LANGUAGE_DISPLAY_NAME: Record<Language, string> = {
  [LANGUAGE.EN]: 'English 🇬🇧',
  [LANGUAGE.SV]: 'Svenska 🇸🇪',
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AppCopyOverrides = DeepPartial<AppCopy>;

const deepMerge = <T extends Record<string, unknown>>(
  target: T,
  source: DeepPartial<T>,
): T => {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      typeof targetVal === 'object' &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as DeepPartial<Record<string, unknown>>,
      ) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }
  return result;
};

export const resolveAppCopy = (overrides?: AppCopyOverrides): AppCopy =>
  overrides ? deepMerge(DEFAULT_APP_COPY, overrides) : DEFAULT_APP_COPY;

export const DEFAULT_APP_COPY = {
  COMMON: {
    SUBMIT: 'Submit',
    CANCEL: 'Cancel',
    CLOSE: 'Close',
    SAVE: 'Save',
    YES: 'Yes',
  },
  HOME_VIEW: {
    ASK_LUNCH_BUTTON: 'Ask about lunch 🍔',
    CHECKOUT_BUTTON: 'Check out 🏃💨',
    ADMIN_SETTINGS_BUTTON: 'Admin Settings ⚙️',
    USER_SETTINGS_BUTTON: 'User Settings ⚙️',
    HELP_BUTTON: 'Help ❓',
    SELECT_OFFICE_DAYS_MARKDOWN: '*Select your office days:*',
    ADD_VISIT_DETAILS_BUTTON: 'Add visit details. 🐶🏢🕐💬',
    CREATE_EVENT_BUTTON: 'Create Office Event 📅',
    WHO_IS_IN_OFFICE_MARKDOWN: "*Who's in the office?*",
    NO_ONE_SCHEDULED: 'No one scheduled',
    WHOLE_DAY: ' | 🕐 Whole day',
    AFTERNOON_ONLY: ' | 🕐 Afternoon only',
    MORNING_ONLY: ' | 🕘 Morning only',
    PERSON: 'person',
    PEOPLE: 'people',
    EDIT_EVENT_BUTTON: 'Edit',
    DELETE_EVENT_BUTTON: 'Delete',
    DELETE_EVENT_CONFIRM_TITLE: 'Delete event?',
    DELETE_EVENT_CONFIRM_DENY: 'Cancel',
    LOCATION_SELECT_PLACEHOLDER: 'Select your home office',
    LOCATION_SELECT_LABEL: '*Home Office*\nSelect your home office',
  },
  PRESENCE_MODAL: {
    TITLE: 'Schedule Office Visit',
    SELECT_DAYS_LABEL: 'Select your office days',
    UNDECIDED: 'undecided',
    WHOLE_DAY: 'the whole day',
    MORNING_ONLY: 'the morning only',
    AFTERNOON_ONLY: 'the afternoon only',
    PRESENCE_LABEL: 'I will be here for.. 🕐',
    BRINGING_DOG_LABEL: 'Bringing dog? 🐶',
    MESSAGE_LABEL: 'Message 💬',
    OFFICE_LABEL: 'Which office are you checking into? 🏢',
  },
  SETTINGS_MODAL: {
    TITLE: 'User Settings',
    COMING_SOON_MARKDOWN: '_Settings coming soon!_',
    ADD_OFFICE_LABEL: 'Add a new office',
    ADD_OFFICE_PLACEHOLDER: 'e.g. Berlin',
    DEFAULT_OFFICE_LABEL: 'Default office 🏢',
    DEFAULT_OFFICE_PLACEHOLDER: 'Select your default office',
    SHOW_WEEKDAYS_ONLY_LABEL: 'Show weekdays only',
    SHOW_WEEKDAYS_ONLY_OPTION: 'Show weekdays only',
    SHOW_TEAM_COUNT_LABEL: 'Show team count',
    SHOW_TEAM_COUNT_OPTION: 'Show team count',
    LANGUAGE_LABEL: 'Language 🌐',
    LANGUAGE_PLACEHOLDER: 'Select your language',
  },
  ASK_LUNCH_MODAL: {
    NO_USERS_MARKDOWN: 'No other users are in the office today for lunch 😢',
    SELECT_USERS_MARKDOWN: '*Select users to invite:*',
    TITLE: 'Ask for Lunch',
    SUBMIT: 'Send Invites',
  },
  CREATE_EVENT_MODAL: {
    TITLE: 'Create Office Event',
    EVENT_NAME_LABEL: 'Event Name',
    EVENT_DATE_LABEL: 'Event Date',
    EVENT_TIME_HOUR_LABEL: 'Hour',
    EVENT_TIME_MINUTE_LABEL: 'Minute',
    EVENT_DESCRIPTION_LABEL: 'Description',
    EVENT_ATTENDEES_LABEL: 'Select Attendees',
  },
  EDIT_EVENT_MODAL: {
    TITLE: 'Edit Office Event',
  },
  HELP_MODAL: {
    TITLE: 'Help',
    OVERVIEW_HEADER: 'Overview',
    OVERVIEW_TEXT:
      'Mark which days you plan to be in the office, add visit details (office location, time of day, dog, message), and see who else will be in.',
    OFFICE_DAYS_HEADER: 'Selecting Office Days',
    OFFICE_DAYS_TEXT:
      'Check the days you plan to come in using the *Select your office days* checkboxes. Your selections are saved automatically.',
    VISIT_DETAILS_HEADER: 'Adding Visit Details',
    VISIT_DETAILS_TEXT:
      "Click *Add visit details* to set your office location, whether you'll be there in the morning, afternoon, or all day, whether you're bringing a dog, and an optional message.",
    EVENTS_HEADER: 'Office Events',
    EVENTS_TEXT:
      'Use *Create Office Event* to schedule a shared event. Other users can RSVP by checking the event checkbox next to their day.',
    LUNCH_HEADER: 'Ask About Lunch',
    LUNCH_TEXT:
      "When you're checked in for today, an *Ask about lunch* button appears. Use it to send a lunch invite to others in the office.",
    SETTINGS_HEADER: 'User Settings',
    SETTINGS_TEXT:
      'Click *User Settings* to set your default office, choose your language, toggle weekends, and toggle team count display.',
  },
  ACTIONS: {
    CHECKED_OUT_MESSAGE: 'has left the building!',
    NO_USERS_SELECTED: "You didn't select any users to invite.",
    askingAboutLunch(userId: string) {
      return `<@${userId}> is asking about lunch today! 🍔`;
    },
    createdGroupChat(count: number) {
      return `Created a group chat with ${count} users!`;
    },
  },
  getAppDescription(appName: string) {
    return `${appName} makes it easy to plan your office visits. Mark which office you are visiting, when you'll be in, whole day, morning, afternoon, or if you are bringing your dog. You can also leave a note for additional information about your visit ie _Bringing surdeg!_.`;
  },
  getReminderDmText(appName: string, botUserId?: string) {
    const appMention = botUserId ? `<@${botUserId}>` : `@${appName}`;
    return `Friendly reminder to plan your office presence using ${appMention}.\n\nClick the Home tab to get started!`;
  },
};

export const SWEDISH_APP_COPY: AppCopy = {
  COMMON: {
    SUBMIT: 'Skicka',
    CANCEL: 'Avbryt',
    CLOSE: 'Stäng',
    SAVE: 'Spara',
    YES: 'Ja',
  },
  HOME_VIEW: {
    ASK_LUNCH_BUTTON: 'Fråga om lunch 🍔',
    CHECKOUT_BUTTON: 'Checka ut 🏃💨',
    ADMIN_SETTINGS_BUTTON: 'Admininställningar ⚙️',
    USER_SETTINGS_BUTTON: 'Inställningar ⚙️',
    HELP_BUTTON: 'Hjälp ❓',
    SELECT_OFFICE_DAYS_MARKDOWN: '*Välj dina kontorsdagar:*',
    ADD_VISIT_DETAILS_BUTTON: 'Lägg till besöksdetaljer. 🐶🏢🕐💬',
    CREATE_EVENT_BUTTON: 'Skapa kontorsevent 📅',
    WHO_IS_IN_OFFICE_MARKDOWN: '*Vem är på kontoret?*',
    NO_ONE_SCHEDULED: 'Ingen inbokad',
    WHOLE_DAY: ' | 🕐 Hela dagen',
    AFTERNOON_ONLY: ' | 🕐 Endast eftermiddag',
    MORNING_ONLY: ' | 🕘 Endast förmiddag',
    PERSON: 'person',
    PEOPLE: 'personer',
    EDIT_EVENT_BUTTON: 'Redigera',
    DELETE_EVENT_BUTTON: 'Ta bort',
    DELETE_EVENT_CONFIRM_TITLE: 'Ta bort event?',
    DELETE_EVENT_CONFIRM_DENY: 'Avbryt',
    LOCATION_SELECT_PLACEHOLDER: 'Välj ditt hemmakontor',
    LOCATION_SELECT_LABEL: '*Hemmakontor*\nVälj ditt hemmakontor',
  },
  PRESENCE_MODAL: {
    TITLE: 'Boka kontorsbesök',
    SELECT_DAYS_LABEL: 'Välj dina kontorsdagar',
    UNDECIDED: 'obestämt',
    WHOLE_DAY: 'hela dagen',
    MORNING_ONLY: 'endast förmiddagen',
    AFTERNOON_ONLY: 'endast eftermiddagen',
    PRESENCE_LABEL: 'Jag är här under.. 🕐',
    BRINGING_DOG_LABEL: 'Tar med hund? 🐶',
    MESSAGE_LABEL: 'Meddelande 💬',
    OFFICE_LABEL: 'Vilket kontor checkar du in på? 🏢',
  },
  SETTINGS_MODAL: {
    TITLE: 'Inställningar',
    COMING_SOON_MARKDOWN: '_Inställningar kommer snart!_',
    ADD_OFFICE_LABEL: 'Lägg till ett nytt kontor',
    ADD_OFFICE_PLACEHOLDER: 't.ex. Berlin',
    DEFAULT_OFFICE_LABEL: 'Standardkontor 🏢',
    DEFAULT_OFFICE_PLACEHOLDER: 'Välj ditt standardkontor',
    SHOW_WEEKDAYS_ONLY_LABEL: 'Visa endast vardagar',
    SHOW_WEEKDAYS_ONLY_OPTION: 'Visa endast vardagar',
    SHOW_TEAM_COUNT_LABEL: 'Visa antal i teamet',
    SHOW_TEAM_COUNT_OPTION: 'Visa antal i teamet',
    LANGUAGE_LABEL: 'Språk 🌐',
    LANGUAGE_PLACEHOLDER: 'Välj ditt språk',
  },
  ASK_LUNCH_MODAL: {
    NO_USERS_MARKDOWN: 'Ingen annan är på kontoret för lunch idag 😢',
    SELECT_USERS_MARKDOWN: '*Välj användare att bjuda in:*',
    TITLE: 'Fråga om lunch',
    SUBMIT: 'Skicka inbjudningar',
  },
  CREATE_EVENT_MODAL: {
    TITLE: 'Skapa kontorsevent',
    EVENT_NAME_LABEL: 'Eventnamn',
    EVENT_DATE_LABEL: 'Eventdatum',
    EVENT_TIME_HOUR_LABEL: 'Timme',
    EVENT_TIME_MINUTE_LABEL: 'Minut',
    EVENT_DESCRIPTION_LABEL: 'Beskrivning',
    EVENT_ATTENDEES_LABEL: 'Välj deltagare',
  },
  EDIT_EVENT_MODAL: {
    TITLE: 'Redigera kontorsevent',
  },
  HELP_MODAL: {
    TITLE: 'Hjälp',
    OVERVIEW_HEADER: 'Översikt',
    OVERVIEW_TEXT:
      'Markera vilka dagar du planerar att vara på kontoret, lägg till besöksdetaljer (kontorsplats, tid på dagen, hund, meddelande) och se vilka andra som kommer att vara där.',
    OFFICE_DAYS_HEADER: 'Välja kontorsdagar',
    OFFICE_DAYS_TEXT:
      'Bocka för de dagar du planerar att komma in med kryssrutorna *Välj dina kontorsdagar*. Dina val sparas automatiskt.',
    VISIT_DETAILS_HEADER: 'Lägga till besöksdetaljer',
    VISIT_DETAILS_TEXT:
      'Klicka på *Lägg till besöksdetaljer* för att ange kontorsplats, om du är där på förmiddagen, eftermiddagen eller hela dagen, om du tar med en hund och ett valfritt meddelande.',
    EVENTS_HEADER: 'Kontorsevent',
    EVENTS_TEXT:
      'Använd *Skapa kontorsevent* för att boka ett gemensamt event. Andra användare kan anmäla sig genom att bocka för eventets kryssruta vid sin dag.',
    LUNCH_HEADER: 'Fråga om lunch',
    LUNCH_TEXT:
      'När du är incheckad för idag visas en knapp *Fråga om lunch*. Använd den för att skicka en lunchinbjudan till andra på kontoret.',
    SETTINGS_HEADER: 'Inställningar',
    SETTINGS_TEXT:
      'Klicka på *Inställningar* för att ange ditt standardkontor, välja ditt språk, växla helger och växla visning av antal i teamet.',
  },
  ACTIONS: {
    CHECKED_OUT_MESSAGE: 'har lämnat byggnaden!',
    NO_USERS_SELECTED: 'Du valde inga användare att bjuda in.',
    askingAboutLunch(userId: string) {
      return `<@${userId}> frågar om lunch idag! 🍔`;
    },
    createdGroupChat(count: number) {
      return `Skapade en gruppchatt med ${count} användare!`;
    },
  },
  getAppDescription(appName: string) {
    return `${appName} gör det enkelt att planera dina kontorsbesök. Markera vilket kontor du besöker, när du är där, hela dagen, förmiddagen, eftermiddagen, eller om du tar med din hund. Du kan också lämna en notis med ytterligare information om ditt besök, t.ex. _Tar med surdeg!_.`;
  },
  getReminderDmText(appName: string, botUserId?: string) {
    const appMention = botUserId ? `<@${botUserId}>` : `@${appName}`;
    return `Vänlig påminnelse att planera din kontorsnärvaro med ${appMention}.\n\nKlicka på fliken Hem för att komma igång!`;
  },
};

export const COPY_BY_LANGUAGE: Record<Language, AppCopy> = {
  [LANGUAGE.EN]: DEFAULT_APP_COPY,
  [LANGUAGE.SV]: SWEDISH_APP_COPY,
};

export const resolveAppCopyForLanguage = (
  language: Language,
  overrides?: AppCopyOverrides,
): AppCopy => {
  const base = COPY_BY_LANGUAGE[language] ?? DEFAULT_APP_COPY;
  return overrides ? deepMerge(base, overrides) : base;
};
