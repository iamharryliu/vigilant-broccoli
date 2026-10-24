import {
  OfficePresenceAppRunConfig,
  SLACK_MODE,
  resolveSlackMode,
  runOfficePresenceApp,
  validateSlackEnv,
} from '@vigilant-broccoli/slackbots';
import { buildHttpService, readHttpServiceConfig } from './http-service';

// Local runs default to 3001 like every other service; the Dockerfile and Fly config set 3000.
const DEFAULT_HTTP_PORT = 3001;
const DEFAULT_SOCKET_PORT = 3000;
const DEFAULT_HOST = '127.0.0.1';

const OFFICE_PRESENCE_APP_RUN_CONFIG: OfficePresenceAppRunConfig = {
  OFFICES: process.env.OFFICES
    ? process.env.OFFICES.split(',')
    : ['Berlin', 'Stockholm', 'Paris', 'New York'],
  enableReminders: process.env.ENABLE_REMINDERS === 'true',
  includeWeekends: process.env.INCLUDE_WEEKENDS === 'true',
  reminderTimezone: process.env.REMINDER_TIMEZONE,
};

const startHttp = async () => {
  const port = Number(process.env.PORT || DEFAULT_HTTP_PORT);
  const host = process.env.HOST || DEFAULT_HOST;
  const app = await buildHttpService(
    readHttpServiceConfig(OFFICE_PRESENCE_APP_RUN_CONFIG),
  );
  await app.listen({ port, host });
  console.log(`⚡️ Office presence (HTTP mode) is listening on ${host}:${port}`);
};

const start = async () => {
  const mode = resolveSlackMode();
  validateSlackEnv(mode);
  if (mode === SLACK_MODE.HTTP) {
    await startHttp();
    return;
  }
  await runOfficePresenceApp({
    ...OFFICE_PRESENCE_APP_RUN_CONFIG,
    port: Number(process.env.PORT || DEFAULT_SOCKET_PORT),
  });
};

start().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
