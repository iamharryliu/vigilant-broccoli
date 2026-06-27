import { KnownBlock, ModalView, View } from '@slack/types';
import { AppConfig, PRESENCE_TIME } from '../types';
import { SlackViewBuilder } from '@vigilant-broccoli/slack-workspace';
import { APP_ACTION } from './app.consts';
import {
  loadAllPresences,
  loadEventById,
  loadUserSettings,
} from '../utils/db.utils';
import { getUpcomingWeekdays, formatISODateLocal } from '../utils/date.utils';
import { buildModalDateOptionSlackBlocks } from '../utils/view.utils';
import { ACTION_ID, BLOCK_ID, INPUT_MAX_LENGTH } from './data.consts';
import { LANGUAGE, LANGUAGE_DISPLAY_NAME, Language } from './app-copy.const';

const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export function createInputScheduleModal(appConfig: AppConfig) {
  return function getInputScheduleModal(userId: string) {
    const settings = loadUserSettings(userId);
    const copy = appConfig.getCopy(settings.language);
    const dates = getUpcomingWeekdays(10);
    const options = buildModalDateOptionSlackBlocks(dates);
    const officeBlocks =
      appConfig.OFFICES.length > 0
        ? [
            buildOfficeBlock(
              appConfig,
              copy.PRESENCE_MODAL.OFFICE_LABEL,
              BLOCK_ID.OFFICE,
              settings.defaultOffice,
            ),
          ]
        : [];

    return {
      type: 'modal',
      callback_id: APP_ACTION.SUBMIT_SCHEDULE,
      title: SlackViewBuilder.generatePlainText(copy.PRESENCE_MODAL.TITLE),
      submit: SlackViewBuilder.generatePlainText(copy.COMMON.SUBMIT),
      close: SlackViewBuilder.generatePlainText(copy.COMMON.CANCEL),
      blocks: [
        {
          type: 'input',
          block_id: BLOCK_ID.DATE,
          element: {
            type: 'checkboxes',
            action_id: ACTION_ID.DATE,
            options,
            initial_options: [options[0]],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.PRESENCE_MODAL.SELECT_DAYS_LABEL,
          ),
        },
        ...officeBlocks,
        {
          type: 'input',
          block_id: BLOCK_ID.PRESENCE,
          element: {
            type: 'radio_buttons',
            action_id: ACTION_ID.PRESENCE,
            initial_option: {
              text: SlackViewBuilder.generatePlainText(
                copy.PRESENCE_MODAL.UNDECIDED,
              ),
              value: PRESENCE_TIME.UNDECIDED,
            },
            options: [
              {
                text: SlackViewBuilder.generatePlainText(
                  copy.PRESENCE_MODAL.UNDECIDED,
                ),
                value: PRESENCE_TIME.UNDECIDED,
              },
              {
                text: SlackViewBuilder.generatePlainText(
                  copy.PRESENCE_MODAL.WHOLE_DAY,
                ),
                value: PRESENCE_TIME.WHOLE_DAY,
              },
              {
                text: SlackViewBuilder.generatePlainText(
                  copy.PRESENCE_MODAL.MORNING_ONLY,
                ),
                value: PRESENCE_TIME.MORNING,
              },
              {
                text: SlackViewBuilder.generatePlainText(
                  copy.PRESENCE_MODAL.AFTERNOON_ONLY,
                ),
                value: PRESENCE_TIME.AFTERNOON,
              },
            ],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.PRESENCE_MODAL.PRESENCE_LABEL,
          ),
          optional: true,
        },
        {
          type: 'input',
          block_id: BLOCK_ID.DOG,
          element: {
            type: 'checkboxes',
            action_id: ACTION_ID.DOG,
            options: [
              {
                text: SlackViewBuilder.generatePlainText(copy.COMMON.YES),
                value: ACTION_ID.DOG,
              },
            ],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.PRESENCE_MODAL.BRINGING_DOG_LABEL,
          ),
          optional: true,
        },
        {
          type: 'input',
          block_id: BLOCK_ID.MESSAGE,
          element: {
            type: 'plain_text_input',
            action_id: ACTION_ID.MESSAGE,
            multiline: true,
            max_length: INPUT_MAX_LENGTH,
          },
          label: SlackViewBuilder.generatePlainText(
            copy.PRESENCE_MODAL.MESSAGE_LABEL,
          ),
          optional: true,
        },
      ],
    } as View;
  };
}

type OfficeOption = {
  text: { type: 'plain_text'; text: string };
  value: string;
};

type OfficeBlock = {
  type: 'input';
  block_id: string;
  element: {
    type: 'radio_buttons';
    action_id: string;
    options: OfficeOption[];
    initial_option?: OfficeOption;
  };
  label: { type: 'plain_text'; text: string };
  optional: boolean;
};

function buildOfficeBlock(
  appConfig: AppConfig,
  officeLabel: string,
  blockId = BLOCK_ID.OFFICE,
  initialOffice?: string,
): OfficeBlock {
  const options = appConfig.OFFICES.map(office => ({
    text: { type: 'plain_text' as const, text: office },
    value: office,
  }));
  const initialOption = initialOffice
    ? options.find(o => o.value === initialOffice)
    : undefined;
  return {
    type: 'input',
    block_id: blockId,
    element: {
      type: 'radio_buttons',
      action_id: ACTION_ID.OFFICE,
      options,
      ...(initialOption && { initial_option: initialOption }),
    },
    label: {
      type: 'plain_text',
      text: officeLabel,
    },
    optional: true,
  };
}

export function createUserSettingsModal(appConfig: AppConfig) {
  return function getUserSettingsModal(userId: string) {
    const settings = loadUserSettings(userId);
    const copy = appConfig.getCopy(settings.language);

    const effectiveShowWeekdaysOnly =
      settings.showWeekdaysOnly ?? appConfig.defaultShowWeekdaysOnly;
    const effectiveShowTeamCount =
      settings.showTeamCount ?? appConfig.defaultShowTeamCount;
    const effectiveLanguage = settings.language ?? LANGUAGE.EN;

    const languageOption = (language: Language) => ({
      text: SlackViewBuilder.generatePlainText(LANGUAGE_DISPLAY_NAME[language]),
      value: language,
    });
    const languageOptions = Object.values(LANGUAGE).map(languageOption);
    const languageBlock: KnownBlock = {
      type: 'input',
      block_id: BLOCK_ID.LANGUAGE,
      element: {
        type: 'static_select',
        action_id: ACTION_ID.LANGUAGE,
        options: languageOptions,
        initial_option: languageOption(effectiveLanguage),
        placeholder: SlackViewBuilder.generatePlainText(
          copy.SETTINGS_MODAL.LANGUAGE_PLACEHOLDER,
        ),
      },
      label: SlackViewBuilder.generatePlainText(
        copy.SETTINGS_MODAL.LANGUAGE_LABEL,
      ),
    };

    const officeBlocks: KnownBlock[] =
      appConfig.OFFICES.length > 0
        ? [
            (() => {
              const options = appConfig.OFFICES.map(office => ({
                text: { type: 'plain_text' as const, text: office },
                value: office,
              }));
              const initialOption = settings.defaultOffice
                ? options.find(o => o.value === settings.defaultOffice)
                : undefined;
              return {
                type: 'input' as const,
                block_id: BLOCK_ID.DEFAULT_OFFICE,
                element: {
                  type: 'static_select' as const,
                  action_id: ACTION_ID.DEFAULT_OFFICE,
                  options,
                  placeholder: {
                    type: 'plain_text' as const,
                    text: copy.SETTINGS_MODAL.DEFAULT_OFFICE_PLACEHOLDER,
                  },
                  ...(initialOption && { initial_option: initialOption }),
                },
                label: {
                  type: 'plain_text' as const,
                  text: copy.SETTINGS_MODAL.DEFAULT_OFFICE_LABEL,
                },
                optional: true,
              };
            })(),
          ]
        : [];

    const weekdaysOnlyOption = {
      text: SlackViewBuilder.generatePlainText(
        copy.SETTINGS_MODAL.SHOW_WEEKDAYS_ONLY_OPTION,
      ),
      value: ACTION_ID.SHOW_WEEKDAYS_ONLY,
    };

    const teamCountOption = {
      text: SlackViewBuilder.generatePlainText(
        copy.SETTINGS_MODAL.SHOW_TEAM_COUNT_OPTION,
      ),
      value: ACTION_ID.SHOW_TEAM_COUNT,
    };

    const modal: ModalView = {
      type: 'modal',
      callback_id: APP_ACTION.SUBMIT_SETTINGS,
      title: { type: 'plain_text', text: copy.SETTINGS_MODAL.TITLE },
      submit: { type: 'plain_text', text: copy.COMMON.SAVE },
      close: { type: 'plain_text', text: copy.COMMON.CANCEL },
      blocks: [
        languageBlock,
        ...officeBlocks,
        {
          type: 'input',
          block_id: BLOCK_ID.SHOW_WEEKDAYS_ONLY,
          element: {
            type: 'checkboxes',
            action_id: ACTION_ID.SHOW_WEEKDAYS_ONLY,
            options: [weekdaysOnlyOption],
            ...(effectiveShowWeekdaysOnly && {
              initial_options: [weekdaysOnlyOption],
            }),
          },
          label: SlackViewBuilder.generatePlainText(
            copy.SETTINGS_MODAL.SHOW_WEEKDAYS_ONLY_LABEL,
          ),
          optional: true,
        },
        {
          type: 'input',
          block_id: BLOCK_ID.SHOW_TEAM_COUNT,
          element: {
            type: 'checkboxes',
            action_id: ACTION_ID.SHOW_TEAM_COUNT,
            options: [teamCountOption],
            ...(effectiveShowTeamCount && {
              initial_options: [teamCountOption],
            }),
          },
          label: SlackViewBuilder.generatePlainText(
            copy.SETTINGS_MODAL.SHOW_TEAM_COUNT_LABEL,
          ),
          optional: true,
        },
      ],
    };

    return modal;
  };
}

const mockButton = (label: string): KnownBlock => ({
  type: 'actions',
  elements: [
    {
      type: 'button',
      text: { type: 'plain_text', text: label },
      action_id: APP_ACTION.HELP_MOCK_BUTTON,
    },
  ],
});

export function createHelpModal(appConfig: AppConfig) {
  return function getHelpModal(userId: string) {
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    const h = copy.HELP_MODAL;
    const hv = copy.HOME_VIEW;

    const modal: ModalView = {
      type: 'modal',
      title: { type: 'plain_text', text: h.TITLE },
      close: { type: 'plain_text', text: copy.COMMON.CLOSE },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${h.OVERVIEW_HEADER}*\n${h.OVERVIEW_TEXT}`,
          },
        },
        SlackViewBuilder.DIVIDER,
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${h.OFFICE_DAYS_HEADER}*\n${h.OFFICE_DAYS_TEXT}`,
          },
        },
        SlackViewBuilder.DIVIDER,
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${h.VISIT_DETAILS_HEADER}*\n${h.VISIT_DETAILS_TEXT}`,
          },
        },
        mockButton(hv.ADD_VISIT_DETAILS_BUTTON),
        SlackViewBuilder.DIVIDER,
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${h.EVENTS_HEADER}*\n${h.EVENTS_TEXT}`,
          },
        },
        mockButton(hv.CREATE_EVENT_BUTTON),
        SlackViewBuilder.DIVIDER,
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${h.LUNCH_HEADER}*\n${h.LUNCH_TEXT}`,
          },
        },
        mockButton(hv.ASK_LUNCH_BUTTON),
        SlackViewBuilder.DIVIDER,
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${h.SETTINGS_HEADER}*\n${h.SETTINGS_TEXT}`,
          },
        },
        mockButton(hv.USER_SETTINGS_BUTTON),
      ] as KnownBlock[],
    };

    return modal;
  };
}

export function createAskLunchModal(appConfig: AppConfig) {
  return function getAskLunchModal(userId: string) {
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    const userPresences = loadAllPresences();
    const today = new Date().toISOString().split('T')[0];

    const usersInOffice: { label: string; value: string }[] = [];

    for (const [uid, presences] of Object.entries(userPresences)) {
      if (presences[today] && uid !== userId) {
        usersInOffice.push({
          label: presences[today].office
            ? `<@${uid}> | 🏢 ${presences[today].office}`
            : `<@${uid}>`,
          value: uid,
        });
      }
    }

    let blocks: KnownBlock[];

    if (usersInOffice.length === 0) {
      blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: copy.ASK_LUNCH_MODAL.NO_USERS_MARKDOWN,
          },
        },
      ];
    } else {
      const userChunks = chunkArray(usersInOffice, 10);

      blocks = userChunks.map((chunk, index) => ({
        type: 'section',
        block_id: `users_select_block_${index}`,
        text: {
          type: 'mrkdwn',
          text: index === 0 ? copy.ASK_LUNCH_MODAL.SELECT_USERS_MARKDOWN : ' ',
        },
        accessory: {
          type: 'checkboxes',
          action_id: `users_checkbox_${index}`,
          options: chunk.map(user => ({
            text: { type: 'plain_text', text: user.label },
            value: user.value,
          })),
        },
      }));
    }

    const modal: ModalView = {
      type: 'modal',
      callback_id: APP_ACTION.ASK_LUNCH,
      title: { type: 'plain_text', text: copy.ASK_LUNCH_MODAL.TITLE },
      submit: usersInOffice.length
        ? { type: 'plain_text', text: copy.ASK_LUNCH_MODAL.SUBMIT }
        : undefined,
      close: { type: 'plain_text', text: copy.COMMON.CLOSE },
      blocks,
    };

    return modal;
  };
}

export function createCreateEventModal(appConfig: AppConfig) {
  return function getCreateEventModal(userId: string) {
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    const dates = getUpcomingWeekdays(10);
    const options = buildModalDateOptionSlackBlocks(dates);
    const todayISO = formatISODateLocal(new Date());
    const initialOptions = options.filter(opt => opt.value === todayISO);

    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
      text: SlackViewBuilder.generatePlainText(String(i).padStart(2, '0')),
      value: String(i),
    }));

    const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
      m => ({
        text: SlackViewBuilder.generatePlainText(String(m).padStart(2, '0')),
        value: String(m),
      }),
    );

    return {
      type: 'modal',
      callback_id: APP_ACTION.SUBMIT_CREATE_EVENT,
      title: SlackViewBuilder.generatePlainText(copy.CREATE_EVENT_MODAL.TITLE),
      submit: SlackViewBuilder.generatePlainText(copy.COMMON.SUBMIT),
      close: SlackViewBuilder.generatePlainText(copy.COMMON.CANCEL),
      blocks: [
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_NAME,
          element: {
            type: 'plain_text_input',
            action_id: ACTION_ID.EVENT_NAME,
            max_length: INPUT_MAX_LENGTH,
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_NAME_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_DATE,
          element: {
            type: 'static_select',
            action_id: ACTION_ID.EVENT_DATE,
            options,
            ...(initialOptions.length > 0 && {
              initial_option: initialOptions[0],
            }),
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_DATE_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_TIME_HOUR,
          element: {
            type: 'static_select',
            action_id: ACTION_ID.EVENT_TIME_HOUR,
            options: hourOptions,
            initial_option: hourOptions[12],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_TIME_HOUR_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_TIME_MINUTE,
          element: {
            type: 'static_select',
            action_id: ACTION_ID.EVENT_TIME_MINUTE,
            options: minuteOptions,
            initial_option: minuteOptions[0],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_TIME_MINUTE_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_DESCRIPTION,
          element: {
            type: 'plain_text_input',
            action_id: ACTION_ID.EVENT_DESCRIPTION,
            multiline: true,
            max_length: INPUT_MAX_LENGTH,
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_DESCRIPTION_LABEL,
          ),
          optional: true,
        },
      ],
    } as View;
  };
}

export function createEditEventModal(appConfig: AppConfig) {
  return function getEditEventModal(eventId: number, userId: string) {
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    const event = loadEventById(eventId);
    if (!event) return null;

    const dates = getUpcomingWeekdays(10);
    const options = buildModalDateOptionSlackBlocks(dates);
    const initialDateOption = options.find(opt => opt.value === event.date);

    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
      text: SlackViewBuilder.generatePlainText(String(i).padStart(2, '0')),
      value: String(i),
    }));

    const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
      m => ({
        text: SlackViewBuilder.generatePlainText(String(m).padStart(2, '0')),
        value: String(m),
      }),
    );

    const [eventHour, eventMinute] = event.time.split(':');
    const initialHourOption = hourOptions.find(
      opt => opt.value === String(parseInt(eventHour, 10)),
    );
    const initialMinuteOption = minuteOptions.find(
      opt => opt.value === String(parseInt(eventMinute, 10)),
    );

    return {
      type: 'modal',
      callback_id: `${APP_ACTION.SUBMIT_EDIT_EVENT}_${eventId}`,
      title: SlackViewBuilder.generatePlainText(copy.EDIT_EVENT_MODAL.TITLE),
      submit: SlackViewBuilder.generatePlainText(copy.COMMON.SAVE),
      close: SlackViewBuilder.generatePlainText(copy.COMMON.CANCEL),
      blocks: [
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_NAME,
          element: {
            type: 'plain_text_input',
            action_id: ACTION_ID.EVENT_NAME,
            initial_value: event.name,
            max_length: INPUT_MAX_LENGTH,
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_NAME_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_DATE,
          element: {
            type: 'static_select',
            action_id: ACTION_ID.EVENT_DATE,
            options,
            ...(initialDateOption && { initial_option: initialDateOption }),
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_DATE_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_TIME_HOUR,
          element: {
            type: 'static_select',
            action_id: ACTION_ID.EVENT_TIME_HOUR,
            options: hourOptions,
            initial_option: initialHourOption || hourOptions[12],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_TIME_HOUR_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_TIME_MINUTE,
          element: {
            type: 'static_select',
            action_id: ACTION_ID.EVENT_TIME_MINUTE,
            options: minuteOptions,
            initial_option: initialMinuteOption || minuteOptions[0],
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_TIME_MINUTE_LABEL,
          ),
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_DESCRIPTION,
          element: {
            type: 'plain_text_input',
            action_id: ACTION_ID.EVENT_DESCRIPTION,
            multiline: true,
            max_length: INPUT_MAX_LENGTH,
            ...(event.description && { initial_value: event.description }),
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_DESCRIPTION_LABEL,
          ),
          optional: true,
        },
        {
          type: 'input',
          block_id: BLOCK_ID.EVENT_ATTENDEES,
          element: {
            type: 'multi_users_select',
            action_id: ACTION_ID.EVENT_ATTENDEES,
            ...(event.attendees &&
              event.attendees.length > 0 && {
                initial_users: event.attendees,
              }),
          },
          label: SlackViewBuilder.generatePlainText(
            copy.CREATE_EVENT_MODAL.EVENT_ATTENDEES_LABEL,
          ),
          optional: true,
        },
      ],
    } as View;
  };
}
