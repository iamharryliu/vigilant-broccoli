import 'dotenv/config';
import {
  runOfficePresenceApp,
  OfficePresenceAppRunConfig,
} from '@vigilant-broccoli/slackbots';

const OFFICE_PRESENCE_APP_RUN_CONFIG: OfficePresenceAppRunConfig = {
  APP_NAME: 'Office Presence Demo',
  OFFICES: [],
  enableReminders: false,
};

(async () => {
  await runOfficePresenceApp(OFFICE_PRESENCE_APP_RUN_CONFIG);
})();
