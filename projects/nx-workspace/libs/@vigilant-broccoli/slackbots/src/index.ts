export * from './lib/consts';
export * from './lib/utils/modal.utils';
export * from './lib/utils/utils';

export { runOfficePresenceApp } from './office-presence-app/office-presence-app';
export type { OfficePresenceAppRunConfig } from './office-presence-app/office-presence-app';
export { runOfficePresenceMock } from './office-presence-app/mock/mock-server';
export { createOfficePresenceHttpRuntime } from './office-presence-app/http/http-runtime';
export {
  DEFAULT_SLACK_MODE,
  SLACK_MODE,
  resolveSlackMode,
  validateSlackEnv,
} from './office-presence-app/slack-mode';
export type { SlackMode } from './office-presence-app/slack-mode';
export {
  DEMO_OPERATION,
  DEMO_SESSION_ID_PATTERN,
  DemoApiError,
  createDemoApi,
} from './office-presence-app/demo/demo-api';
export type {
  DemoApi,
  DemoOperation,
  DirectoryUser,
} from './office-presence-app/demo/demo-api';
export {
  seedDemoData,
  seedDemoDataIfEmpty,
} from './office-presence-app/demo/demo-seed';
export type {
  SeedOptions,
  SeedResult,
} from './office-presence-app/demo/demo-seed';
export { DEMO_OFFICES } from './office-presence-app/consts/demo-users.const';
