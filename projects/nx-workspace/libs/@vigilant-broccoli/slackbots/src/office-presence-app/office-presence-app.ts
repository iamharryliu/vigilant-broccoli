import {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
} from '@slack/bolt';
import { View } from '@slack/types';
import * as cron from 'node-cron';
import { SLACK_EVENT } from '../lib/consts';
import { SlackModalUtils } from '../lib/utils/modal.utils';
import { SlackUtils } from '../lib/utils/utils';
import {
  createAskLunchModal,
  createHelpModal,
  createInputScheduleModal,
  createCreateEventModal,
  createEditEventModal,
  createUserSettingsModal,
} from './consts/modals.const';
import {
  handleAskLunchAction,
  handleCheckboxAction,
  handleScheduleModalSubmit,
  handleSelectDefaultOffice,
  handleSettingsModalSubmit,
  handleCreateEventSubmit,
  handleEventAttendanceToggle,
  handleDeleteEvent,
  handleEditEventSubmit,
} from './utils/action.utils';
import { createPublishHomeView } from './utils/view.utils';
import { APP_ACTION, APP_COMMAND } from './consts/app.consts';
import { loadAllPresences, savePresence } from './utils/db.utils';
import { createReminderSender, createReminderPreviewer } from './app-reminder';
import { AppConfig } from './types';
import {
  AppCopyOverrides,
  DEFAULT_LANGUAGE,
  Language,
  resolveAppCopyForLanguage,
} from './consts/app-copy.const';
import { loadUserSettings } from './utils/db.utils';

export type OfficePresenceAppRunConfig = {
  APP_NAME?: string;
  OFFICES?: string[];
  port?: number;
  reminderCron?: string;
  reminderTimezone?: string;
  enableReminders?: boolean;
  includeWeekends?: boolean;
  defaultShowWeekdaysOnly?: boolean;
  defaultShowTeamCount?: boolean;
  defaultWeeksAhead?: number;
  copy?: AppCopyOverrides;
};

const DEFAULT_PORT = 3000;
const DEFAULT_REMINDER_CRON = '0 8 * * 1';
const DEFAULT_REMINDER_TIMEZONE = 'Europe/Stockholm';
const DEFAULT_APP_NAME = 'OK-IN';
const DEFAULT_OFFICES: string[] = [];
const DEFAULT_SHOW_WEEKDAYS_ONLY = true;
const DEFAULT_SHOW_TEAM_COUNT = true;
const DEFAULT_WEEKS_AHEAD = 3;

// eslint-disable-next-line complexity
export async function runOfficePresenceApp(
  config: OfficePresenceAppRunConfig = {},
) {
  const {
    APP_NAME,
    OFFICES,
    includeWeekends,
    defaultShowWeekdaysOnly,
    defaultShowTeamCount,
    defaultWeeksAhead,
    copy,
  } = config;
  const getCopy = (language?: Language) =>
    resolveAppCopyForLanguage(language ?? DEFAULT_LANGUAGE, copy);
  const appConfig: AppConfig = {
    APP_NAME: APP_NAME ?? DEFAULT_APP_NAME,
    OFFICES: OFFICES ?? DEFAULT_OFFICES,
    includeWeekends,
    defaultShowWeekdaysOnly:
      defaultShowWeekdaysOnly ?? DEFAULT_SHOW_WEEKDAYS_ONLY,
    defaultShowTeamCount: defaultShowTeamCount ?? DEFAULT_SHOW_TEAM_COUNT,
    defaultWeeksAhead: defaultWeeksAhead ?? DEFAULT_WEEKS_AHEAD,
    copy: getCopy(DEFAULT_LANGUAGE),
    getCopy,
  };
  const publishHomeView = createPublishHomeView(appConfig);
  const getInputScheduleModal = createInputScheduleModal(appConfig);
  const getAskLunchModal = createAskLunchModal(appConfig);
  const getUserSettingsModal = createUserSettingsModal(appConfig);
  const getHelpModal = createHelpModal(appConfig);
  const getCreateEventModal = createCreateEventModal(appConfig);
  const getEditEventModal = createEditEventModal(appConfig);
  const sendReminders = createReminderSender(appConfig);
  const previewReminder = createReminderPreviewer(appConfig);

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

  app.action<BlockAction>(
    APP_ACTION.OPEN_SCHEDULE_MODAL,
    SlackModalUtils.createModalHandlerWithUserId(getInputScheduleModal),
  );

  app.action<BlockAction>(
    APP_ACTION.OPEN_SETTINGS_MODAL,
    SlackModalUtils.createModalHandlerWithUserId(getUserSettingsModal),
  );

  app.action<BlockAction>(
    APP_ACTION.SELECT_DEFAULT_OFFICE,
    async ({ ack, body, client }) => {
      await ack();
      handleSelectDefaultOffice(body);
      await publishHomeView(client, body);
    },
  );

  app.action<BlockAction>(
    APP_ACTION.OPEN_HELP_MODAL,
    SlackModalUtils.createModalHandlerWithUserId(getHelpModal),
  );

  const pushModal =
    (modalFactory: (userId: string) => View | null) =>
    async ({
      ack,
      body,
      client,
    }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) => {
      await ack();
      const view = modalFactory(body.user.id);
      if (view) {
        await client.views.push({ trigger_id: body.trigger_id, view });
      }
    };

  app.action<BlockAction>(
    APP_ACTION.HELP_DEMO_SCHEDULE,
    pushModal(getInputScheduleModal),
  );
  app.action<BlockAction>(
    APP_ACTION.HELP_DEMO_EVENT,
    pushModal(getCreateEventModal),
  );
  app.action<BlockAction>(
    APP_ACTION.HELP_DEMO_LUNCH,
    pushModal(getAskLunchModal),
  );
  app.action<BlockAction>(
    APP_ACTION.HELP_DEMO_SETTINGS,
    pushModal(getUserSettingsModal),
  );

  app.view(APP_ACTION.SUBMIT_SETTINGS, async ({ ack, body, view, client }) => {
    await ack();
    handleSettingsModalSubmit(body, view);
    await publishHomeView(client, body);
  });

  app.action<BlockAction>(
    APP_ACTION.OPEN_ASK_LUNCH_MODAL,
    SlackModalUtils.createModalHandlerWithUserId(getAskLunchModal),
  );

  app.action<BlockAction>(
    APP_ACTION.OPEN_CREATE_EVENT_MODAL,
    SlackModalUtils.createModalHandlerWithUserId(getCreateEventModal),
  );

  app.view(
    APP_ACTION.SUBMIT_CREATE_EVENT,
    async ({ ack, body, view, client }) => {
      await ack();
      handleCreateEventSubmit(body, view);
      await publishHomeView(client, body);
    },
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
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    await handleAskLunchAction(userId, selectedUsers, client, copy);
  });

  app.action(
    APP_ACTION.SUBMIT_CHECKOUT,
    createCheckoutAction(appConfig, publishHomeView),
  );

  app.action<BlockAction>(
    new RegExp(`^${APP_ACTION.TOGGLE_EVENT_ATTENDANCE}_\\d+$`),
    async ({ ack, body, client }) => {
      await ack();
      handleEventAttendanceToggle(body);
      await publishHomeView(client, body);
    },
  );

  app.action<BlockAction>(
    new RegExp(`^${APP_ACTION.DELETE_EVENT}_\\d+$`),
    async ({ ack, body, client }) => {
      await ack();
      handleDeleteEvent(body);
      await publishHomeView(client, body);
    },
  );

  app.action<BlockAction>(
    new RegExp(`^${APP_ACTION.EDIT_EVENT}_\\d+$`),
    async ({ ack, body, client }) => {
      await ack();
      const actionId = body.actions[0].action_id;
      const eventIdStr = actionId.split('_').pop();
      if (!eventIdStr) return;
      const eventId = parseInt(eventIdStr, 10);
      const modal = getEditEventModal(eventId, body.user.id);
      if (modal) {
        await client.views.open({
          trigger_id: body.trigger_id,
          view: modal,
        });
      }
    },
  );

  app.view(
    new RegExp(`^${APP_ACTION.SUBMIT_EDIT_EVENT}_\\d+$`),
    async ({ ack, body, view, client }) => {
      await ack();
      const callbackId = view.callback_id;
      const eventIdStr = callbackId.split('_').pop();
      if (!eventIdStr) return;
      const eventId = parseInt(eventIdStr, 10);
      handleEditEventSubmit(eventId, body, view);
      await publishHomeView(client, body);
    },
  );

  app.command(APP_COMMAND.PREVIEW_REMINDER, async ({ ack, command }) => {
    await ack();
    await previewReminder(command.user_id);
  });

  await app.start(config.port ?? DEFAULT_PORT);
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
  appConfig: AppConfig,
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
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    presence.message = copy.ACTIONS.CHECKED_OUT_MESSAGE;
    savePresence(userId, today, presence);
    await publishHomeView(client, body);
  };
}
