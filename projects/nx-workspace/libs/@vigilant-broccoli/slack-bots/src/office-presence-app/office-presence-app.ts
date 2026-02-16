import {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
} from '@slack/bolt';
import * as cron from 'node-cron';
import { SLACK_EVENT } from '../lib/consts';
import { SlackModalUtils } from '../lib/utils/modal.utils';
import { SlackUtils } from '../lib/utils/utils';
import {
  getAskLunchModal,
  createInputScheduleModal,
  getSettingModal,
} from './consts/modals.const';
import {
  handleAskLunchAction,
  handleCheckboxAction,
  handleScheduleModalSubmit,
  handleUpdateSettings,
} from './utils/action.utils';
import { createPublishHomeView } from './utils/view.utils';
import { APP_ACTION } from './consts/app.consts';
import { loadAllPresences, savePresence } from './utils/db.utils';
import { createReminderSender } from './app-reminder';
import { AppConfig } from './types';

export type OfficePresenceAppRunConfig = {
  id?: string;
  APP_NAME?: string;
  OFFICES?: string[];
  port?: number;
  reminderCron?: string;
  reminderTimezone?: string;
  enableReminders?: boolean;
};

const DEFAULT_PORT = 3000;
const DEFAULT_REMINDER_CRON = '0 8 * * 1';
const DEFAULT_REMINDER_TIMEZONE = 'Europe/Stockholm';
const DEFAULT_APP_NAME = 'OK-IN';
const DEFAULT_OFFICES: string[] = [];

// eslint-disable-next-line complexity
export async function runOfficePresenceApp(
  config: OfficePresenceAppRunConfig = {},
) {
  const { id, APP_NAME, OFFICES } = config;
  const appConfig: AppConfig = {
    id,
    APP_NAME: APP_NAME ?? DEFAULT_APP_NAME,
    OFFICES: OFFICES ?? DEFAULT_OFFICES,
  };
  const publishHomeView = createPublishHomeView(appConfig);
  const getInputScheduleModal = createInputScheduleModal(appConfig);
  const sendReminders = createReminderSender(appConfig);

  const app = SlackUtils.getSocketApp();

  app.event(SLACK_EVENT.HOME_OPENED, async ({ event, client }) => {
    await publishHomeView(client, event);
  });

  app.action<BlockAction>(
    APP_ACTION.WORKDAY_CHECKBOXES,
    async ({ ack, body, client }) => {
      await ack();
      handleCheckboxAction(body);
      await publishHomeView(client, body);
    },
  );

  app.view(APP_ACTION.SUBMIT_SCHEDULE, async ({ ack, body, view, client }) => {
    await ack();
    handleScheduleModalSubmit(body, view);
    await publishHomeView(client, body);
  });

  app.view(APP_ACTION.SUBMIT_SETTINGS, async ({ ack, body, view, client }) => {
    await ack();
    handleUpdateSettings(body, view);
    await publishHomeView(client, body);
  });

  app.action<BlockAction>(
    APP_ACTION.OPEN_SCHEDULE_MODAL,
    SlackModalUtils.createModalHandler(getInputScheduleModal),
  );

  app.action<BlockAction>(
    APP_ACTION.OPEN_ASK_LUNCH_MODAL,
    SlackModalUtils.createModalHandlerWithUserId(getAskLunchModal),
  );

  app.action<BlockAction>(
    APP_ACTION.OPEN_SETTINGS_MODAL,
    SlackModalUtils.createModalHandler(getSettingModal),
  );

  app.view(APP_ACTION.ASK_LUNCH, async ({ body, ack, client }) => {
    await ack();
    const userId = body.user.id;
    const stateValues = body.view.state.values;
    const selectedUsers: string[] = [];

    for (const actionMap of Object.values(stateValues)) {
      for (const action of Object.values(actionMap)) {
        if (action.type === 'checkboxes' && action.selected_options?.length) {
          for (const opt of action.selected_options) {
            selectedUsers.push(opt.value);
          }
        }
      }
    }
    await handleAskLunchAction(userId, selectedUsers, client);
  });

  app.action(APP_ACTION.SUBMIT_CHECKOUT, createCheckoutAction(publishHomeView));

  await app.start(config.port ?? DEFAULT_PORT);
  // eslint-disable-next-line no-console
  console.log(`⚡️ ${appConfig.APP_NAME} is running!`);

  if (config.enableReminders ?? true) {
    cron.schedule(
      config.reminderCron ?? DEFAULT_REMINDER_CRON,
      async () => {
        await sendReminders();
      },
      {
        timezone: config.reminderTimezone ?? DEFAULT_REMINDER_TIMEZONE,
      },
    );
  }
}

function createCheckoutAction(
  publishHomeView: ReturnType<typeof createPublishHomeView>,
) {
  return async function handleCheckoutAction({
    body,
    ack,
    client,
  }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) {
    await ack();

    const userId = body.user.id;
    const today = new Date().toISOString().split('T')[0];

    const allPresences = loadAllPresences();
    const userPresences = allPresences[userId];
    const presence = userPresences[today];
    presence.message = 'has left the building!';
    savePresence(userId, today, presence);
    await publishHomeView(client, body);
  };
}
