export * from './error.const';
export * from './error.model';

// Personal Website
export * from './endpoints.const';
export * from './requests.model';

export const APP_NAME = {
  HARRYLIU_DESIGN: 'HARRYLIU_DESIGN',
  CLOUD_8_SKATE: 'CLOUD_8_SKATE',
} as const;
type APP_NAME_KEYS = keyof typeof APP_NAME;
export type AppName = (typeof APP_NAME)[APP_NAME_KEYS];
