import { AppHomeOpenedEvent, View, KnownBlock } from '@slack/types';
import { loadAllPresences, loadAllEvents, loadUserSettings } from './db.utils';
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

function buildLocationSelect(appConfig: AppConfig, defaultOffice?: string) {
  if (appConfig.OFFICES.length === 0) return null;
  const { copy } = appConfig;
  const options = appConfig.OFFICES.map(office => ({
    text: { type: 'plain_text' as const, text: office, emoji: true },
    value: office,
  }));
  const initialOption = options.find(o => o.value === defaultOffice);
  return {
    type: 'static_select' as const,
    action_id: APP_ACTION.SELECT_DEFAULT_OFFICE,
    placeholder: {
      type: 'plain_text' as const,
      text: copy.HOME_VIEW.LOCATION_SELECT_PLACEHOLDER,
      emoji: true,
    },
    options,
    ...(initialOption && { initial_option: initialOption }),
  };
}

function getHomeView(userId: string, appConfig: AppConfig): View {
  const { copy } = appConfig;
  const userSettings = loadUserSettings(userId);

  const showWeekdaysOnly =
    userSettings.showWeekdaysOnly ?? appConfig.defaultShowWeekdaysOnly;
  const showTeamCount =
    userSettings.showTeamCount ?? appConfig.defaultShowTeamCount;

  const includeWeekends = !showWeekdaysOnly;

  const userPresences = loadAllPresences();
  if (!userPresences[userId]) {
    userPresences[userId] = {};
  }
  const selected = Object.keys(userPresences[userId]);
  const checkboxDates = getUpcomingWeekdays(14, includeWeekends).slice(0, 10);
  const presenceDates = getUpcomingWeekdays(
    appConfig.defaultWeeksAhead * 7,
    includeWeekends,
  );
  const options = buildModalDateOptionSlackBlocks(checkboxDates);
  const initial = options.filter(opt => selected.includes(opt.value));
  const today = formatISODateLocal(new Date());
  const isCheckedInToday = selected.includes(today);

  const locationSelect = buildLocationSelect(
    appConfig,
    userSettings.defaultOffice,
  );

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
              copy.HOME_VIEW.USER_SETTINGS_BUTTON,
            ),
            action_id: APP_ACTION.OPEN_SETTINGS_MODAL,
          },
          {
            type: 'button',
            text: SlackViewBuilder.generatePlainText(
              copy.HOME_VIEW.HELP_BUTTON,
            ),
            action_id: APP_ACTION.OPEN_HELP_MODAL,
          },
        ],
      },
      SlackViewBuilder.DIVIDER,
      ...(locationSelect
        ? [
            {
              ...SlackViewBuilder.generateMarkdownSection(
                copy.HOME_VIEW.LOCATION_SELECT_LABEL,
              ),
              accessory: locationSelect,
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
          {
            type: 'button',
            text: SlackViewBuilder.generatePlainText(
              copy.HOME_VIEW.CREATE_EVENT_BUTTON,
            ),
            action_id: APP_ACTION.OPEN_CREATE_EVENT_MODAL,
          },
          ...(isCheckedInToday
            ? [
                {
                  type: 'button' as const,
                  text: SlackViewBuilder.generatePlainText(
                    copy.HOME_VIEW.ASK_LUNCH_BUTTON,
                  ),
                  action_id: APP_ACTION.OPEN_ASK_LUNCH_MODAL,
                  style: 'primary' as const,
                },
                {
                  type: 'button' as const,
                  text: SlackViewBuilder.generatePlainText(
                    copy.HOME_VIEW.CHECKOUT_BUTTON,
                  ),
                  action_id: APP_ACTION.SUBMIT_CHECKOUT,
                  style: 'primary' as const,
                },
              ]
            : []),
        ],
      },
      SlackViewBuilder.DIVIDER,
      ...buildPresenceBlocks(
        presenceDates,
        userPresences,
        userId,
        copy,
        showTeamCount,
      ),
    ],
  } as View;
}

function buildPresenceBlocks(
  days: Date[],
  userPresences: UserPresences,
  currentUserId: string,
  copy: AppCopy,
  showTeamCount: boolean,
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
      showTeamCount,
    );

    blocks.push(
      SlackViewBuilder.generateMarkdownSection(sectionText) as KnownBlock,
    );

    if (eventsForDay.length > 0) {
      blocks.push(...buildEventBlocks(eventsForDay, currentUserId, copy));
    }
  });

  return blocks;
}

function buildEventBlocks(
  events: OfficeEvent[],
  currentUserId: string,
  copy: AppCopy,
): KnownBlock[] {
  const blocks: KnownBlock[] = [];

  for (const event of events) {
    const attendeeCount = event.attendees?.length || 0;
    const isAttending = event.attendees?.includes(currentUserId) || false;
    const isCreator = event.creatorId === currentUserId;

    const mainText = `${event.name} @ ${event.time} by <@${event.creatorId}> - (${attendeeCount} attending)`;
    const checkboxOption = {
      text: SlackViewBuilder.generatePlainText(mainText),
      ...(event.description && {
        description: SlackViewBuilder.generatePlainText(event.description),
      }),
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
            text: SlackViewBuilder.generatePlainText(
              copy.HOME_VIEW.EDIT_EVENT_BUTTON,
            ),
            action_id: `${APP_ACTION.EDIT_EVENT}_${event.id}`,
            style: 'primary',
          },
          {
            type: 'button',
            text: SlackViewBuilder.generatePlainText(
              copy.HOME_VIEW.DELETE_EVENT_BUTTON,
            ),
            action_id: `${APP_ACTION.DELETE_EVENT}_${event.id}`,
            style: 'danger',
            confirm: {
              title: SlackViewBuilder.generatePlainText(
                copy.HOME_VIEW.DELETE_EVENT_CONFIRM_TITLE,
              ),
              text: {
                type: 'mrkdwn',
                text: `Delete *${event.name}* on ${event.date} at ${event.time}?`,
              },
              confirm: SlackViewBuilder.generatePlainText(
                copy.HOME_VIEW.DELETE_EVENT_BUTTON,
              ),
              deny: SlackViewBuilder.generatePlainText(
                copy.HOME_VIEW.DELETE_EVENT_CONFIRM_DENY,
              ),
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
  showTeamCount: boolean,
): string {
  const count = presences.length;
  if (count === 0) {
    return `${datePrefix} - _${copy.HOME_VIEW.NO_ONE_SCHEDULED}_`;
  }
  const countLabel = showTeamCount
    ? ` - *${count} ${count === 1 ? copy.HOME_VIEW.PERSON : copy.HOME_VIEW.PEOPLE}*`
    : '';
  const officeBreakdown = showTeamCount ? buildOfficeBreakdown(presences) : '';
  const breakdownLine = officeBreakdown ? `\n_${officeBreakdown}_` : '';
  return `${datePrefix}${countLabel}\n${formattedPresences.join('\n')}${breakdownLine}`;
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
  if (presence.presenceTime === PRESENCE_TIME.WHOLE_DAY)
    parts.push(copy.HOME_VIEW.WHOLE_DAY);
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
