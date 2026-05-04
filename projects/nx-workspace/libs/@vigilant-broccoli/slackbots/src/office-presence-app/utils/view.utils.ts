import { AppHomeOpenedEvent, View, KnownBlock } from '@slack/types';
import { loadAllPresences, loadAllEvents } from './db.utils';
import { INPUT_MAX_LENGTH } from '../consts/data.consts';
import {
  AppConfig,
  PRESENCE_TIME,
  UserPresence,
  UserPresences,
  OfficeEvent,
} from '../types';
import { WebClient } from '@slack/web-api';
import { BlockAction, SlackViewAction } from '@slack/bolt';
import { SlackViewBuilder } from '@vigilant-broccoli/slack-workspace';
import { AppCopy } from '../consts/app-copy.const';
import {
  formatDateLong,
  formatISODateLocal,
  getUpcomingWeekdays,
  getWeekNumber,
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

const MONDAY = 1;

function formatDateWithWeek(date: Date, index: number): string {
  const showWeek = index === 0 || date.getDay() === MONDAY;
  return showWeek
    ? `${formatDateLong(date)} - Week ${getWeekNumber(date)}`
    : formatDateLong(date);
}

export function buildModalDateOptionSlackBlocks(dates: Date[]): {
  text: { type: string; text: string };
  value: string;
}[] {
  return dates.map((date, index) => ({
    text: SlackViewBuilder.generatePlainText(formatDateWithWeek(date, index)),
    value: formatISODateLocal(date),
  }));
}

function getHomeView(userId: string, appConfig: AppConfig): View {
  const { copy } = appConfig;
  const userPresences = loadAllPresences();
  if (!userPresences[userId]) {
    userPresences[userId] = {};
  }
  const selected = Object.keys(userPresences[userId]);
  const dates = getUpcomingWeekdays(
    appConfig.daysAhead ?? 14,
    appConfig.includeWeekends,
  );
  const options = buildModalDateOptionSlackBlocks(dates);
  const initial = options.filter(opt => selected.includes(opt.value));
  const today = formatISODateLocal(new Date());
  const isCheckedInToday = selected.includes(today);

  return {
    type: 'home',
    blocks: [
      SlackViewBuilder.generateHeader(appConfig.APP_NAME),
      SlackViewBuilder.generateMarkdownSection(
        copy.getAppDescription(appConfig.APP_NAME),
      ),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: SlackViewBuilder.generatePlainText(
              copy.HOME_VIEW.CREATE_EVENT_BUTTON,
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
                    copy.HOME_VIEW.ASK_LUNCH_BUTTON,
                  ),
                  action_id: APP_ACTION.OPEN_ASK_LUNCH_MODAL,
                  style: 'primary',
                },
                {
                  type: 'button',
                  text: SlackViewBuilder.generatePlainText(
                    copy.HOME_VIEW.CHECKOUT_BUTTON,
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
          copy.HOME_VIEW.SELECT_OFFICE_DAYS_MARKDOWN,
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
              copy.HOME_VIEW.ADD_VISIT_DETAILS_BUTTON,
            ),
            action_id: APP_ACTION.OPEN_SCHEDULE_MODAL,
          },
        ],
      },
      SlackViewBuilder.DIVIDER,
      ...buildPresenceBlocks(dates, userPresences, userId, copy),
    ],
  } as View;
}

function buildPresenceBlocks(
  days: Date[],
  userPresences: UserPresences,
  currentUserId: string,
  copy: AppCopy,
): KnownBlock[] {
  const blocks: KnownBlock[] = [
    SlackViewBuilder.generateMarkdownSection(
      copy.HOME_VIEW.WHO_IS_IN_OFFICE_MARKDOWN,
    ) as KnownBlock,
  ];
  const allEvents = loadAllEvents();

  days.forEach((date, index) => {
    const iso = formatISODateLocal(date);
    const eventsForDay = allEvents
      .filter(event => event.date === iso)
      .sort((a, b) => a.time.localeCompare(b.time));

    const dayPresences = Object.entries(userPresences)
      .filter(([_, presence]) => presence?.[iso])
      .map(([u, presence]) => ({ userId: u, presence: presence[iso] }));

    const formattedPresences = dayPresences.map(({ userId, presence }) =>
      formatPresence(userId, presence, eventsForDay, copy),
    );

    const datePrefix = `*${formatDateWithWeek(date, index)}*`;
    const sectionText = buildDaySectionText(
      datePrefix,
      dayPresences.map(({ presence }) => presence),
      formattedPresences,
      copy,
    );

    blocks.push(
      SlackViewBuilder.generateMarkdownSection(sectionText) as KnownBlock,
    );

    if (eventsForDay.length > 0) {
      blocks.push(...buildEventBlocks(eventsForDay, currentUserId));
    }
  });

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
    const fullEventText = `${event.name} @ ${event.time} by <@${event.creatorId}> - (${attendeeCount} attending)${descriptionText}`;
    const eventText =
      fullEventText.length > INPUT_MAX_LENGTH
        ? fullEventText.substring(0, INPUT_MAX_LENGTH - 1) + '…'
        : fullEventText;

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

function buildDaySectionText(
  datePrefix: string,
  presences: UserPresence[],
  formattedPresences: string[],
  copy: AppCopy,
): string {
  const count = presences.length;
  if (count === 0) {
    return `${datePrefix} - _${copy.HOME_VIEW.NO_ONE_SCHEDULED}_`;
  }
  const officeBreakdown = buildOfficeBreakdown(presences);
  const breakdownSuffix = officeBreakdown ? ` (${officeBreakdown})` : '';
  const peopleLabel = count === 1 ? 'person' : 'people';
  return `${datePrefix} - *${count} ${peopleLabel}${breakdownSuffix}*\n${formattedPresences.join('\n')}`;
}

function buildOfficeBreakdown(presences: UserPresence[]): string {
  const counts = new Map<string, number>();
  for (const presence of presences) {
    if (!presence?.office) continue;
    counts.set(presence.office, (counts.get(presence.office) ?? 0) + 1);
  }
  if (counts.size === 0) return '';
  return Array.from(counts.entries())
    .map(([office, n]) => `${office}: ${n}`)
    .join(', ');
}

function formatPresence(
  u: string,
  presence: UserPresence,
  eventsForDay: OfficeEvent[],
  copy: AppCopy,
): string {
  if (!presence) return `<@${u}>`;

  const parts: string[] = [];
  if (presence.isBringingDog) parts.push(' 🐶');
  if (presence.office) parts.push('🏢 ' + presence.office);
  if (presence.presenceTime === PRESENCE_TIME.AFTERNOON)
    parts.push(copy.HOME_VIEW.AFTERNOON_ONLY);
  if (presence.presenceTime === PRESENCE_TIME.MORNING)
    parts.push(copy.HOME_VIEW.MORNING_ONLY);
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
