export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';
export * from './lib/socket/socket.consts';

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
  INTERNAL: 'internal',
} as const;

export type OpenType = (typeof OPEN_TYPE)[keyof typeof OPEN_TYPE];

// Audio
export * from './lib/audio/audio.consts';

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
