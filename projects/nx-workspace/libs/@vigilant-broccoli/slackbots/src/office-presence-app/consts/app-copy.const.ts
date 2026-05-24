export type AppCopy = typeof DEFAULT_APP_COPY;

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
    WEEKS_AHEAD_LABEL: 'Weeks ahead to display',
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
