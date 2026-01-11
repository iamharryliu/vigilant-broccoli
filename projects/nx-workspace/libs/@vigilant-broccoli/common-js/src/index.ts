export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];

export const OPEN_TYPE = {
  BROWSER: 'browser',
  MAC_APPLICATION: 'mac_application',
  FILE_SYSTEM: 'file_system',
  VSCODE: 'vscode',
} as const;

export type OpenType = (typeof OPEN_TYPE)[keyof typeof OPEN_TYPE];

// LLM
export * from './lib/llm/llm.consts';
export * from './lib/llm/llm.types';

// JSON Placeholder
export * from './lib/jsonplaceholder/jsonplaceholder.services';
export * from './lib/jsonplaceholder/jsonplaceholder.types';

// Utils
export * from './lib/utils/env.utils';
export * from './lib/utils/string.utils';
export * from './lib/utils/date.utils';

export * from './lib/github/github.types';

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export const GOOGLE_SERVICES = {
  PHOTOS: {
    NAME: 'Google Photos',
    URL: 'https://photos.google.com/?pli=1',
  },
  CONTACTS: {
    NAME: 'Google Contacts',
    URL: 'https://contacts.google.com/',
  },
  DRIVE: {
    NAME: 'Google Drive',
    URL: 'https://drive.google.com/drive/u/0/my-drive',
  },
  MAPS: {
    NAME: 'Google Maps',
    URL: 'https://www.google.com/maps',
  },
  TRANSLATE: {
    NAME: 'Google Translate',
    URL: 'https://translate.google.com/',
  },
  GMAIL: {
    NAME: 'Gmail',
    URL: 'https://mail.google.com',
  },
  CALENDAR: {
    NAME: 'Google Calendar',
    URL: 'https://calendar.google.com/',
  },
  MEET: {
    NAME: 'Google Meet',
    URL: 'https://meet.google.com/',
  },
  YOUTUBE: {
    NAME: 'YouTube',
    URL: 'https://www.youtube.com',
  },
} as const;

export const UTILITY_URL = {
  CHATGPT: {
    NAME: 'ChatGPT',
    URL: 'https://chat.openai.com',
  },
  CLAUDE: {
    NAME: 'Claude',
    URL: 'https://claude.ai',
  },
  FIND_MY: {
    NAME: 'Find My',
    URL: 'https://www.icloud.com/find/',
  },
  AMAZON: {
    NAME: 'Amazon',
    URL: 'https://www.amazon.com',
  },
  PINTEREST: {
    NAME: 'Pinterest',
    URL: 'https://www.pinterest.com',
  },
} as const;

export const DATE_CONST = {
  DAY: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
};
