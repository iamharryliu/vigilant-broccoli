export const APP_COPY = {
  COMMON: {
    SUBMIT: 'Submit',
    CANCEL: 'Cancel',
    CLOSE: 'Close',
    SAVE: 'Save',
    YES: 'Yes',
    OPEN_APP: 'Open App',
  },
  HOME_VIEW: {
    ASK_LUNCH_BUTTON: 'Ask about lunch 🍔',
    CHECKOUT_BUTTON: 'Check out 🏃💨',
    ADMIN_SETTINGS_BUTTON: 'Admin Settings ⚙️',
    SELECT_OFFICE_DAYS_MARKDOWN: '*Select your office days:*',
    ADD_VISIT_DETAILS_BUTTON: 'Add visit details. 🐶🏢🕐💬',
    WHO_IS_IN_OFFICE_MARKDOWN: "*Who's in the office?*",
    NO_ONE_SCHEDULED_MARKDOWN: '_No one scheduled_',
    AFTERNOON_ONLY: ' | 🕐 Afternoon only',
    MORNING_ONLY: ' | 🕘 Morning only',
  },
  PRESENCE_MODAL: {
    TITLE: 'Schedule Office Visit',
    SELECT_DAYS_LABEL: 'Select your office days',
    WHOLE_DAY: 'the whole day',
    MORNING_ONLY: 'the morning only',
    AFTERNOON_ONLY: 'the afternoon only',
    PRESENCE_LABEL: 'I will be here for.. 🕐',
    BRINGING_DOG_LABEL: 'Bringing dog? 🐶',
    MESSAGE_LABEL: 'Message 💬',
    OFFICE_LABEL: 'Which office are you checking into? 🏢',
  },
  SETTINGS_MODAL: {
    TITLE: 'Settings',
    COMING_SOON_MARKDOWN: '_Settings coming soon!_',
    ADD_OFFICE_LABEL: 'Add a new office',
    ADD_OFFICE_PLACEHOLDER: 'e.g. Berlin',
  },
  ASK_LUNCH_MODAL: {
    NO_USERS_MARKDOWN: 'No other users are in the office today for lunch 😢',
    SELECT_USERS_MARKDOWN: '*Select users to invite:*',
    TITLE: 'Ask for Lunch',
    SUBMIT: 'Send Invites',
  },
  REMINDER: {
    SECTION_MARKDOWN:
      'Friendly reminder to plan for your office presence with this app.',
  },
  ACTIONS: {
    NO_USERS_SELECTED: "You didn't select any users to invite.",
    askingAboutLunch(userId: string) {
      return `<@${userId}> is asking about lunch today! 🍔`;
    },
    createdGroupChat(count: number) {
      return `Created a group chat with ${count} users!`;
    },
  },
  getAppDescription(appName: string) {
    return `${appName} makes it easy to plan your office visits. Mark which office you are visiting, when you’ll be in, whole day, morning, afternoon, or if you are bringing your dog. You can also leave a note for additional information about your visit ie _Bringing surdeg!_.`;
  },
  getReminderDmText(appName: string) {
    return `Friendly reminder to plan for your office presence using ${appName}!`;
  },
};
