import { AppHomeOpenedEvent, View, KnownBlock } from '@slack/types';
import { loadAllPresences, loadAllEvents } from './db.utils';
import {
  AppConfig,
  PRESENCE_TIME,
  UserPresence,
  UserPresences,
  OfficeEvent,
} from '../types';
import { WebClient } from '@slack/web-api';
import { BlockAction, SlackViewAction } from '@slack/bolt';
import { SlackViewBuilder } from '../../lib/utils/view-builder.utils';
import { APP_COPY } from '../consts/app-copy.const';
import {
  formatDateLong,
  formatDateShort,
  formatISODateLocal,
  getUpcomingWeekdays,
} from './date.utils';
import { APP_ACTION } from '../consts/app.consts';

export function createPublishHomeView(appConfig: AppConfig) {
  return async function publishHomeView(
    client: WebClient,
    source: BlockAction | AppHomeOpenedEvent | SlackViewAction,
  ) {
    const userId =
      typeof source.user === 'string' ? source.user : source.user.id;
    await client.views.publish({
      user_id: userId,
      view: getHomeView(userId, appConfig),
    });
  };
}

export function buildModalDateOptionSlackBlocks(dates: Date[]): {
  text: { type: string; text: string };
  value: string;
}[] {
  return dates.map(date => ({
    text: SlackViewBuilder.generatePlainText(formatDateShort(date)),
    value: formatISODateLocal(date),
  }));
}

function getHomeView(userId: string, appConfig: AppConfig): View {
  const userPresences = loadAllPresences();
  if (!userPresences[userId]) {
    userPresences[userId] = {};
  }
  const selected = Object.keys(userPresences[userId]);
  const dates = getUpcomingWeekdays(10, appConfig.includeWeekends);
  const options = buildModalDateOptionSlackBlocks(dates);
  const initial = options.filter(opt => selected.includes(opt.value));
  const today = formatISODateLocal(new Date());
  const isCheckedInToday = selected.includes(today);

  return {
    type: 'home',
    blocks: [
      SlackViewBuilder.generateHeader(appConfig.APP_NAME),
      SlackViewBuilder.generateMarkdownSection(
        APP_COPY.getAppDescription(appConfig.APP_NAME),
      ),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: SlackViewBuilder.generatePlainText(
              APP_COPY.HOME_VIEW.CREATE_EVENT_BUTTON,
            ),
            action_id: APP_ACTION.OPEN_CREATE_EVENT_MODAL,
          },
        ],
      },
      ...(isCheckedInToday
        ? [
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: SlackViewBuilder.generatePlainText(
                    APP_COPY.HOME_VIEW.ASK_LUNCH_BUTTON,
                  ),
                  action_id: APP_ACTION.OPEN_ASK_LUNCH_MODAL,
                  style: 'primary',
                },
                {
                  type: 'button',
                  text: SlackViewBuilder.generatePlainText(
                    APP_COPY.HOME_VIEW.CHECKOUT_BUTTON,
                  ),
                  action_id: APP_ACTION.SUBMIT_CHECKOUT,
                  style: 'primary',
                },
              ],
            },
            SlackViewBuilder.DIVIDER,
          ]
        : []),
      {
        ...SlackViewBuilder.generateMarkdownSection(
          APP_COPY.HOME_VIEW.SELECT_OFFICE_DAYS_MARKDOWN,
        ),
        accessory: {
          type: 'checkboxes',
          action_id: APP_ACTION.WORKDAY_CHECKBOXES,
          options,
          ...(initial.length > 0 && { initial_options: initial }),
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: SlackViewBuilder.generatePlainText(
              APP_COPY.HOME_VIEW.ADD_VISIT_DETAILS_BUTTON,
            ),
            action_id: APP_ACTION.OPEN_SCHEDULE_MODAL,
          },
        ],
      },
      SlackViewBuilder.DIVIDER,
      ...buildPresenceBlocks(dates, userPresences, userId),
    ],
  } as View;
}

function buildPresenceBlocks(
  days: Date[],
  userPresences: UserPresences,
  currentUserId: string,
): KnownBlock[] {
  const blocks: KnownBlock[] = [
    SlackViewBuilder.generateMarkdownSection(
      APP_COPY.HOME_VIEW.WHO_IS_IN_OFFICE_MARKDOWN,
    ) as KnownBlock,
  ];
  const allEvents = loadAllEvents();

  for (const date of days) {
    const iso = formatISODateLocal(date);
    const eventsForDay = allEvents
      .filter(event => event.date === iso)
      .sort((a, b) => a.time.localeCompare(b.time));

    const formattedPresences = Object.entries(userPresences)
      .filter(([_, presence]) => presence?.[iso])
      .map(([u, presence]) => {
        const dayPresence = presence[iso];
        return formatPresence(u, dayPresence, eventsForDay);
      });

    const presenceText =
      formattedPresences.length > 0
        ? formattedPresences.join('\n')
        : APP_COPY.HOME_VIEW.NO_ONE_SCHEDULED_MARKDOWN;

    blocks.push(
      SlackViewBuilder.generateMarkdownSection(
        `*${formatDateLong(date)}*\n${presenceText}`,
      ) as KnownBlock,
    );

    if (eventsForDay.length > 0) {
      blocks.push(...buildEventBlocks(eventsForDay, currentUserId));
    }
  }

  return blocks;
}

function buildEventBlocks(
  events: OfficeEvent[],
  currentUserId: string,
): KnownBlock[] {
  const blocks: KnownBlock[] = [];

  for (const event of events) {
    const attendeeCount = event.attendees?.length || 0;
    const isAttending = event.attendees?.includes(currentUserId) || false;
    const isCreator = event.creatorId === currentUserId;

    const descriptionText = event.description ? ` - ${event.description}` : '';
    const eventText = `${event.name} @ ${event.time} by <@${event.creatorId}> - (${attendeeCount} attending)${descriptionText}`;

    const checkboxOption = {
      text: {
        type: 'plain_text' as const,
        text: eventText,
      },
      value: `${event.id}`,
    };

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'checkboxes',
          action_id: `${APP_ACTION.TOGGLE_EVENT_ATTENDANCE}_${event.id}`,
          options: [checkboxOption],
          ...(isAttending && { initial_options: [checkboxOption] }),
        },
      ],
    } as KnownBlock);

    if (isCreator) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Edit',
            },
            action_id: `${APP_ACTION.EDIT_EVENT}_${event.id}`,
            style: 'primary',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Delete',
            },
            action_id: `${APP_ACTION.DELETE_EVENT}_${event.id}`,
            style: 'danger',
            confirm: {
              title: {
                type: 'plain_text',
                text: 'Delete event?',
              },
              text: {
                type: 'mrkdwn',
                text: `Delete *${event.name}* on ${event.date} at ${event.time}?`,
              },
              confirm: {
                type: 'plain_text',
                text: 'Delete',
              },
              deny: {
                type: 'plain_text',
                text: 'Cancel',
              },
            },
          },
        ],
      });
    }
  }

  return blocks;
}

function formatPresence(
  u: string,
  presence: UserPresence,
  eventsForDay: OfficeEvent[],
): string {
  if (!presence) return `<@${u}>`;

  const parts: string[] = [];
  if (presence.isBringingDog) parts.push(' 🐶');
  if (presence.office) parts.push('🏢 ' + presence.office);
  if (presence.presenceTime === PRESENCE_TIME.AFTERNOON)
    parts.push(APP_COPY.HOME_VIEW.AFTERNOON_ONLY);
  if (presence.presenceTime === PRESENCE_TIME.MORNING)
    parts.push(APP_COPY.HOME_VIEW.MORNING_ONLY);
  if (presence.message) parts.push(` | 💬 _${presence.message}_`);

  const userEvents = eventsForDay.filter(
    event => event.attendees && event.attendees.includes(u),
  );

  if (userEvents.length > 0) {
    const eventNames = userEvents.map(e => e.name).join(', ');
    parts.push(` | Attending: ${eventNames}`);
  }

  return `<@${u}> ${parts.join(' ')}`.trim();
}
