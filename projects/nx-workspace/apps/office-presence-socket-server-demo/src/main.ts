import 'dotenv/config';
import {
  runOfficePresenceApp,
  OfficePresenceAppRunConfig,
} from '@vigilant-broccoli/slackbots';

const OFFICE_PRESENCE_APP_RUN_CONFIG: OfficePresenceAppRunConfig = {
  OFFICES: process.env.OFFICES ? process.env.OFFICES.split(',') : [],
  enableReminders: process.env.ENABLE_REMINDERS === 'true',
  includeWeekends: process.env.INCLUDE_WEEKENDS === 'true',
  daysAhead: process.env.DAYS_AHEAD ? parseInt(process.env.DAYS_AHEAD, 10) : 14,
};

(async () => {
  await runOfficePresenceApp(OFFICE_PRESENCE_APP_RUN_CONFIG);
})();
