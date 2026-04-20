import { WebClient } from '@slack/web-api';
import { SlackUtils } from '../lib/utils/utils';
import { AppConfig } from './types';

function getClient() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN is not set');
  return new WebClient(token);
}

export function createReminderSender(appConfig: AppConfig) {
  return async function sendReminders() {
    const client = getClient();
    const botUserId = await getBotUserId(client);
    const allUsers = await SlackUtils.getAllRealUsers(client);
    const userIds = allUsers.map(user => user.id);
    for (const userId of userIds) {
      await postMessage(client, userId, appConfig, botUserId);
    }
  };
}

export function createReminderPreviewer(appConfig: AppConfig) {
  return async function previewReminder(userId: string) {
    const client = getClient();
    const botUserId = await getBotUserId(client);
    await postMessage(client, userId, appConfig, botUserId);
  };
}

async function postMessage(
  client: WebClient,
  channel: string,
  appConfig: AppConfig,
  botUserId?: string,
) {
  const { copy } = appConfig;
  const text = copy.getReminderDmText(appConfig.APP_NAME, botUserId);
  try {
    await client.chat.postMessage({ channel, text });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error posting message:', error);
  }
}

async function getBotUserId(client: WebClient) {
  const auth = await client.auth.test();
  return auth.user_id;
}
