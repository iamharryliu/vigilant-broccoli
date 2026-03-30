import { WebClient } from '@slack/web-api';
import { SlackUtils } from '../lib/utils/utils';
import { AppConfig } from './types';
import { APP_COPY } from './consts/app-copy.const';

function getClient() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN is not set');
  return new WebClient(token);
}

export function createReminderSender(appConfig: AppConfig) {
  return async function sendReminders() {
    const client = getClient();
    const openAppUrl = appConfig.id
      ? await getOpenAppUrl(client, appConfig.id)
      : undefined;
    const allUsers = await SlackUtils.getAllRealUsers(client);
    const userIds = allUsers.map(user => user.id);
    for (const userId of userIds) {
      await postMessage(client, userId, appConfig, openAppUrl);
    }
  };
}

async function postMessage(
  client: WebClient,
  channel: string,
  appConfig: AppConfig,
  openAppUrl?: string,
) {
  const blocks: {
    type: 'section' | 'actions';
    text?: { type: 'mrkdwn'; text: string };
    elements?: {
      type: 'button';
      text: { type: 'plain_text'; text: string; emoji: boolean };
      url: string;
    }[];
  }[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: APP_COPY.getReminderDmText(
          appConfig.APP_NAME,
          channel,
          appConfig.id,
        ),
      },
    },
  ];

  if (openAppUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: APP_COPY.COMMON.OPEN_APP,
            emoji: true,
          },
          url: openAppUrl,
        },
      ],
    });
  }

  try {
    await client.chat.postMessage({
      channel,
      text: APP_COPY.getReminderDmText(
        appConfig.APP_NAME,
        channel,
        appConfig.id,
      ),
      blocks,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error posting message:', error);
  }
}

async function getOpenAppUrl(client: WebClient, appId: string) {
  const auth = await client.auth.test();
  return `https://slack.com/app_redirect?app=${encodeURIComponent(
    appId,
  )}&team=${encodeURIComponent(auth.team_id)}`;
}
