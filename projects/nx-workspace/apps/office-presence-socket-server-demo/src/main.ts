import {
  runOfficePresenceApp,
  OfficePresenceAppRunConfig,
} from '@vigilant-broccoli/slackbots';

const OFFICE_PRESENCE_APP_RUN_CONFIG: OfficePresenceAppRunConfig = {
  OFFICES: process.env.OFFICES
    ? process.env.OFFICES.split(',')
    : ['Berlin', 'Stockholm', 'Paris', 'New York'],
  enableReminders: process.env.ENABLE_REMINDERS === 'true',
  includeWeekends: process.env.INCLUDE_WEEKENDS === 'true',
};

(async () => {
  await runOfficePresenceApp(OFFICE_PRESENCE_APP_RUN_CONFIG);
})();
