import {
  AllMiddlewareArgs,
  App,
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
import { PublishHomeView, createPublishHomeView } from './utils/view.utils';
import { APP_ACTION, APP_COMMAND } from './consts/app.consts';
import { loadAllPresences, savePresence } from './utils/db.utils';
import {
  GetUserTodayISO,
  createUserTodayResolver,
} from './utils/time-zone.utils';
import { createReminderSender, createReminderPreviewer } from './app-reminder';
import { AppConfig } from './types';
import {
  AppCopyOverrides,
  DEFAULT_LANGUAGE,
  Language,
  resolveAppCopyForLanguage,
} from './consts/app-copy.const';
import { loadUserSettings } from './utils/db.utils';
import { SLACK_MODE, validateSlackEnv } from './slack-mode';

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

export function createAppConfig(
  config: OfficePresenceAppRunConfig = {},
): AppConfig {
  const {
    APP_NAME,
    OFFICES,
    includeWeekends,
    defaultShowWeekdaysOnly,
    defaultShowTeamCount,
    defaultWeeksAhead,
    reminderTimezone,
    copy,
  } = config;
  const getCopy = (language?: Language) =>
    resolveAppCopyForLanguage(language ?? DEFAULT_LANGUAGE, copy);
  return {
    APP_NAME: APP_NAME ?? DEFAULT_APP_NAME,
    OFFICES: OFFICES ?? DEFAULT_OFFICES,
    includeWeekends,
    defaultShowWeekdaysOnly:
      defaultShowWeekdaysOnly ?? DEFAULT_SHOW_WEEKDAYS_ONLY,
    defaultShowTeamCount: defaultShowTeamCount ?? DEFAULT_SHOW_TEAM_COUNT,
    defaultWeeksAhead: defaultWeeksAhead ?? DEFAULT_WEEKS_AHEAD,
    timeZone: reminderTimezone ?? DEFAULT_REMINDER_TIMEZONE,
    copy: getCopy(DEFAULT_LANGUAGE),
    getCopy,
  };
}

export type OfficePresenceHandlerApp = Pick<
  App,
  'event' | 'action' | 'view' | 'command'
>;

export type RegisterHandlersOptions = {
  // Only the mock client may address seeded members; real Slack clients must not.
  allowDemoRecipients?: boolean;
};

// Shared by Socket Mode, HTTP mode and the mock so all three run the same handlers.
export function registerOfficePresenceHandlers(
  app: OfficePresenceHandlerApp,
  appConfig: AppConfig,
  previewReminder: (userId: string) => Promise<void>,
  { allowDemoRecipients = false }: RegisterHandlersOptions = {},
) {
  const getUserTodayISO = createUserTodayResolver(appConfig.timeZone);
  const publishHomeView = createPublishHomeView(appConfig, getUserTodayISO);
  const getInputScheduleModal = createInputScheduleModal(appConfig);
  const getAskLunchModal = createAskLunchModal(appConfig);
  const getUserSettingsModal = createUserSettingsModal(appConfig);
  const getHelpModal = createHelpModal(appConfig);
  const getCreateEventModal = createCreateEventModal(appConfig);
  const getEditEventModal = createEditEventModal(appConfig);

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

  // Date pickers start at the member's today, so these modals resolve it before opening.
  const openModal =
    (modalFactory: (userId: string, todayISO: string) => View) =>
    async ({
      ack,
      body,
      client,
    }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) => {
      await ack();
      const todayISO = await getUserTodayISO(client, body.user.id);
      await client.views.open({
        trigger_id: body.trigger_id,
        view: modalFactory(body.user.id, todayISO),
      });
    };

  app.action<BlockAction>(
    APP_ACTION.OPEN_SCHEDULE_MODAL,
    openModal(getInputScheduleModal),
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
    (modalFactory: (userId: string, todayISO: string) => View | null) =>
    async ({
      ack,
      body,
      client,
    }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) => {
      await ack();
      const todayISO = await getUserTodayISO(client, body.user.id);
      const view = modalFactory(body.user.id, todayISO);
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
    openModal(getAskLunchModal),
  );

  app.action<BlockAction>(
    APP_ACTION.OPEN_CREATE_EVENT_MODAL,
    openModal(getCreateEventModal),
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
    await handleAskLunchAction(
      userId,
      selectedUsers,
      client,
      copy,
      allowDemoRecipients,
    );
  });

  app.action(
    APP_ACTION.SUBMIT_CHECKOUT,
    createCheckoutAction(appConfig, publishHomeView, getUserTodayISO),
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
      const todayISO = await getUserTodayISO(client, body.user.id);
      const modal = getEditEventModal(eventId, body.user.id, todayISO);
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
}

// Socket Mode only: it needs no public URL and owns the reminder cron. HTTP mode is
// hosted by the service app (see createOfficePresenceHttpRuntime).
export async function runOfficePresenceApp(
  config: OfficePresenceAppRunConfig = {},
) {
  validateSlackEnv(SLACK_MODE.SOCKET);
  const appConfig = createAppConfig(config);
  const sendReminders = createReminderSender(appConfig);
  const previewReminder = createReminderPreviewer(appConfig);

  const app = SlackUtils.getSocketApp();
  registerOfficePresenceHandlers(app, appConfig, previewReminder);

  await app.start(config.port ?? DEFAULT_PORT);
  console.log(`⚡️ ${appConfig.APP_NAME} is running!`);

  if (config.enableReminders ?? true) {
    cron.schedule(
      config.reminderCron ?? DEFAULT_REMINDER_CRON,
      async () => {
        await sendReminders();
      },
      {
        timezone: appConfig.timeZone,
      },
    );
  }
}

function createCheckoutAction(
  appConfig: AppConfig,
  publishHomeView: PublishHomeView,
  getUserTodayISO: GetUserTodayISO,
) {
  return async function handleCheckoutAction({
    body,
    ack,
    client,
  }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) {
    await ack();

    const userId = body.user.id;
    const today = await getUserTodayISO(client, userId);
    // A stale Home view can still show the button after today's presence was removed.
    const presence = loadAllPresences(today)[userId]?.[today];
    if (presence) {
      const copy = appConfig.getCopy(loadUserSettings(userId).language);
      savePresence(userId, today, {
        ...presence,
        message: copy.ACTIONS.CHECKED_OUT_MESSAGE,
      });
    }
    await publishHomeView(client, body);
  };
}
