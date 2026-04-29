import { App, SlackViewAction, BlockAction } from '@slack/bolt';
import { AppHomeOpenedEvent } from '@slack/types';
import type { WebClient } from '@slack/web-api';
import { getAllUsers } from '@vigilant-broccoli/slack-workspace';

function getSocketApp(
  token = process.env.SLACK_BOT_TOKEN,
  appToken = process.env.SLACK_APP_TOKEN,
) {
  return new App({
    token,
    appToken,
    socketMode: true,
  });
}

type SlackUserSource = SlackViewAction | AppHomeOpenedEvent | BlockAction;
function extractUserId(source: SlackUserSource): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (source as any).user?.id === 'string') {
    return (source as SlackViewAction).user.id;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (source as any).user === 'string') {
    return (source as AppHomeOpenedEvent).user;
  }
  throw new Error('Unable to extract user ID from source');
}

async function getIsAdmin(
  source: SlackUserSource,
  client: WebClient,
): Promise<boolean> {
  const userId = extractUserId(source);
  const userInfo = await client.users.info({ user: userId });
  return userInfo.user?.is_admin === true || userInfo.user?.is_owner === true;
}

async function getAllRealUsers(client: WebClient) {
  const allUsers = await getAllUsers(client);
  return allUsers.filter(u => !u.is_bot && !u.deleted && u.id !== 'USLACKBOT');
}

export const SlackUtils = {
  getIsAdmin,
  getAllRealUsers,
  getSocketApp,
};
