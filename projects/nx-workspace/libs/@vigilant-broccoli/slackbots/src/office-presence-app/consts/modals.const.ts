import { KnownBlock, ModalView, View } from '@slack/types';
import { AppConfig, PRESENCE_TIME } from '../types';
import { SlackViewBuilder } from '../../lib/utils/view-builder.utils';
import { APP_ACTION } from './app.consts';
import { APP_COPY } from './app-copy.const';
import { loadAllPresences, loadEventById } from '../utils/db.utils';
import { getUpcomingWeekdays, formatISODateLocal } from '../utils/date.utils';
import { buildModalDateOptionSlackBlocks } from '../utils/view.utils';

export function createInputScheduleModal(appConfig: AppConfig) {
  return function getInputScheduleModal() {
    const dates = getUpcomingWeekdays(10);
    const options = buildModalDateOptionSlackBlocks(dates);
    const initialOptions = [options[0]];
    const officeBlocks =
      appConfig.OFFICES.length > 0 ? [buildOfficeBlock(appConfig.OFFICES)] : [];

    return {
      type: 'modal',
      callback_id: APP_ACTION.SUBMIT_SCHEDULE,
      title: SlackViewBuilder.generatePlainText(APP_COPY.PRESENCE_MODAL.TITLE),
      submit: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.SUBMIT),
      close: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.CANCEL),
      blocks: [
        {
          type: 'input',
          block_id: 'date_block',
          element: {
            type: 'checkboxes',
            action_id: 'date',
            options,
            initial_options: initialOptions,
          },
          label: SlackViewBuilder.generatePlainText(
            APP_COPY.PRESENCE_MODAL.SELECT_DAYS_LABEL,
          ),
        },
        ...officeBlocks,
        {
          type: 'input',
          block_id: 'presence_block',
          element: {
            type: 'radio_buttons',
            action_id: 'presence',
            options: [
              {
                text: SlackViewBuilder.generatePlainText(
                  APP_COPY.PRESENCE_MODAL.WHOLE_DAY,
                ),
                value: PRESENCE_TIME.WHOLE_DAY,
              },
              {
                text: SlackViewBuilder.generatePlainText(
                  APP_COPY.PRESENCE_MODAL.MORNING_ONLY,
                ),
                value: PRESENCE_TIME.MORNING,
              },
              {
                text: SlackViewBuilder.generatePlainText(
                  APP_COPY.PRESENCE_MODAL.AFTERNOON_ONLY,
                ),
                value: PRESENCE_TIME.AFTERNOON,
              },
            ],
          },
          label: SlackViewBuilder.generatePlainText(
            APP_COPY.PRESENCE_MODAL.PRESENCE_LABEL,
          ),
          optional: true,
        },
        {
          type: 'input',
          block_id: 'dog_block',
          element: {
            type: 'checkboxes',
            action_id: 'dog',
            options: [
              {
                text: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.YES),
                value: 'dog',
              },
            ],
          },
          label: SlackViewBuilder.generatePlainText(
            APP_COPY.PRESENCE_MODAL.BRINGING_DOG_LABEL,
          ),
          optional: true,
        },
        {
          type: 'input',
          block_id: 'message_block',
          element: {
            type: 'plain_text_input',
            action_id: 'message',
            multiline: true,
          },
          label: SlackViewBuilder.generatePlainText(
            APP_COPY.PRESENCE_MODAL.MESSAGE_LABEL,
          ),
          optional: true,
        },
      ],
    } as View;
  };
}

type OfficeBlock = {
  type: 'input';
  block_id: string;
  element: {
    type: 'radio_buttons';
    action_id: string;
    options: {
      text: { type: 'plain_text'; text: string };
      value: string;
    }[];
  };
  label: { type: 'plain_text'; text: string };
  optional: boolean;
};

function buildOfficeBlock(
  offices: string[],
  blockId = 'office_block',
): OfficeBlock {
  return {
    type: 'input',
    block_id: blockId,
    element: {
      type: 'radio_buttons',
      action_id: 'office',
      options: offices.map(office => ({
        text: { type: 'plain_text', text: office },
        value: office,
      })),
    },
    label: {
      type: 'plain_text',
      text: APP_COPY.PRESENCE_MODAL.OFFICE_LABEL,
    },
    optional: true,
  };
}

export function getAskLunchModal(userId: string) {
  const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

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
          text: APP_COPY.ASK_LUNCH_MODAL.NO_USERS_MARKDOWN,
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
        text:
          index === 0 ? APP_COPY.ASK_LUNCH_MODAL.SELECT_USERS_MARKDOWN : ' ',
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
    title: { type: 'plain_text', text: APP_COPY.ASK_LUNCH_MODAL.TITLE },
    submit: usersInOffice.length
      ? { type: 'plain_text', text: APP_COPY.ASK_LUNCH_MODAL.SUBMIT }
      : undefined,
    close: { type: 'plain_text', text: APP_COPY.COMMON.CLOSE },
    blocks,
  };

  return modal;
}

export function getCreateEventModal() {
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
    title: SlackViewBuilder.generatePlainText(
      APP_COPY.CREATE_EVENT_MODAL.TITLE,
    ),
    submit: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.SUBMIT),
    close: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.CANCEL),
    blocks: [
      {
        type: 'input',
        block_id: 'event_name_block',
        element: {
          type: 'plain_text_input',
          action_id: 'event_name',
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_NAME_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_date_block',
        element: {
          type: 'static_select',
          action_id: 'event_date',
          options,
          ...(initialOptions.length > 0 && {
            initial_option: initialOptions[0],
          }),
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_DATE_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_time_hour_block',
        element: {
          type: 'static_select',
          action_id: 'event_time_hour',
          options: hourOptions,
          initial_option: hourOptions[12],
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_TIME_HOUR_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_time_minute_block',
        element: {
          type: 'static_select',
          action_id: 'event_time_minute',
          options: minuteOptions,
          initial_option: minuteOptions[0],
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_TIME_MINUTE_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_description_block',
        element: {
          type: 'plain_text_input',
          action_id: 'event_description',
          multiline: true,
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_DESCRIPTION_LABEL,
        ),
        optional: true,
      },
    ],
  } as View;
}

export function getEditEventModal(eventId: number) {
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
    title: SlackViewBuilder.generatePlainText(APP_COPY.EDIT_EVENT_MODAL.TITLE),
    submit: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.SAVE),
    close: SlackViewBuilder.generatePlainText(APP_COPY.COMMON.CANCEL),
    blocks: [
      {
        type: 'input',
        block_id: 'event_name_block',
        element: {
          type: 'plain_text_input',
          action_id: 'event_name',
          initial_value: event.name,
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_NAME_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_date_block',
        element: {
          type: 'static_select',
          action_id: 'event_date',
          options,
          ...(initialDateOption && { initial_option: initialDateOption }),
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_DATE_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_time_hour_block',
        element: {
          type: 'static_select',
          action_id: 'event_time_hour',
          options: hourOptions,
          initial_option: initialHourOption || hourOptions[12],
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_TIME_HOUR_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_time_minute_block',
        element: {
          type: 'static_select',
          action_id: 'event_time_minute',
          options: minuteOptions,
          initial_option: initialMinuteOption || minuteOptions[0],
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_TIME_MINUTE_LABEL,
        ),
      },
      {
        type: 'input',
        block_id: 'event_description_block',
        element: {
          type: 'plain_text_input',
          action_id: 'event_description',
          multiline: true,
          ...(event.description && { initial_value: event.description }),
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_DESCRIPTION_LABEL,
        ),
        optional: true,
      },
      {
        type: 'input',
        block_id: 'event_attendees_block',
        element: {
          type: 'multi_users_select',
          action_id: 'event_attendees',
          ...(event.attendees &&
            event.attendees.length > 0 && {
              initial_users: event.attendees,
            }),
        },
        label: SlackViewBuilder.generatePlainText(
          APP_COPY.CREATE_EVENT_MODAL.EVENT_ATTENDEES_LABEL,
        ),
        optional: true,
      },
    ],
  } as View;
}
