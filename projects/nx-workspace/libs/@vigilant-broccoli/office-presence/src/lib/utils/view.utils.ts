import { AppHomeOpenedEvent, View } from '@slack/types';
import { loadAllPresences } from './db.utils';
import {
  AppConfig,
  PRESENCE_TIME,
  UserPresence,
  UserPresences,
} from '../types';
import { WebClient } from '@slack/web-api';
import { BlockAction, SlackViewAction } from '@slack/bolt';
import { SlackUtils, SlackViewBuilder } from '@vigilant-broccoli/slack-bots';
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
    const isAdmin = await SlackUtils.getIsAdmin(source, client);
    await client.views.publish({
      user_id: userId,
      view: getHomeView(userId, isAdmin, appConfig),
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

function getHomeView(
  userId: string,
  isAdmin: boolean,
  appConfig: AppConfig,
): View {
  const userPresences = loadAllPresences();
  if (!userPresences[userId]) {
    userPresences[userId] = {};
  }
  const selected = Object.keys(userPresences[userId]);
  const dates = getUpcomingWeekdays(10);
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
      ...(isCheckedInToday || isAdmin
        ? [
            {
              type: 'actions',
              elements: [
                ...(isCheckedInToday
                  ? [
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
                    ]
                  : []),

                ...(isAdmin
                  ? [
                      {
                        type: 'button',
                        text: SlackViewBuilder.generatePlainText(
                          APP_COPY.HOME_VIEW.ADMIN_SETTINGS_BUTTON,
                        ),
                        action_id: APP_ACTION.OPEN_SETTINGS_MODAL,
                      },
                    ]
                  : []),
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
      SlackViewBuilder.generateMarkdownSection(
        buildPresence(dates, userPresences),
      ),
    ],
  } as View;
}

function buildPresence(days: Date[], userPresences: UserPresences): string {
  const lines: string[] = [APP_COPY.HOME_VIEW.WHO_IS_IN_OFFICE_MARKDOWN];

  for (const date of days) {
    const iso = formatISODateLocal(date);

    const formattedPresences = Object.entries(userPresences)
      .filter(([_, presence]) => presence?.[iso])
      .map(([u, presence]) => {
        const dayPresence = presence[iso];

        return formatPresence(u, dayPresence);
      });

    lines.push(
      `*${formatDateLong(date)}*\n${
        formattedPresences.length > 0
          ? formattedPresences.join('\n')
          : APP_COPY.HOME_VIEW.NO_ONE_SCHEDULED_MARKDOWN
      }`,
    );
  }

  return lines.join('\n\n');
}

function formatPresence(u: string, presence: UserPresence): string {
  if (!presence) return `<@${u}>`;

  const parts: string[] = [];
  if (presence.isBringingDog) parts.push(' 🐶');
  if (presence.office) parts.push('🏢 ' + presence.office);
  if (presence.presenceTime === PRESENCE_TIME.AFTERNOON)
    parts.push(APP_COPY.HOME_VIEW.AFTERNOON_ONLY);
  if (presence.presenceTime === PRESENCE_TIME.MORNING)
    parts.push(APP_COPY.HOME_VIEW.MORNING_ONLY);
  if (presence.message) parts.push(` | 💬 _${presence.message}_`);

  return `<@${u}> ${parts.join(' ')}`.trim();
}
