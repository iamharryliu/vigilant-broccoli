import { App } from '@slack/bolt';
import { SlackUtils } from '../../lib/utils/utils';
import { DirectoryUser } from '../demo/demo-api';
import { createReminderPreviewer, createReminderSender } from '../app-reminder';
import {
  OfficePresenceAppRunConfig,
  createAppConfig,
  registerOfficePresenceHandlers,
} from '../office-presence-app';
import { createSlackHttpReceiver } from './slack-http-receiver';

const MEMBER_CACHE_MS = 5 * 60 * 1000;
// Web API clients retry for minutes; the demo must not wait on a slow Slack.
const MEMBER_LIST_TIMEOUT_MS = 3000;
const MEMBER_COLORS = [
  '#e8912d',
  '#2eb67d',
  '#36c5f0',
  '#e01e5a',
  '#7c3085',
  '#1264a3',
  '#0b8a6e',
  '#c2410c',
];

const colorFor = (userId: string) =>
  MEMBER_COLORS[
    [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      MEMBER_COLORS.length
  ];

// Everything HTTP mode needs from the lib; the host server owns the port and routes.
export function createOfficePresenceHttpRuntime(
  config: OfficePresenceAppRunConfig,
  env: NodeJS.ProcessEnv = process.env,
) {
  const appConfig = createAppConfig(config);
  const sendReminders = createReminderSender(appConfig);
  const previewReminder = createReminderPreviewer(appConfig);

  const { receiver, handleRequest } = createSlackHttpReceiver(
    env.SLACK_SIGNING_SECRET as string,
  );
  // Bolt otherwise calls auth.test in the constructor and an unreachable Slack
  // or bad token crashes the process as an unhandled rejection; defer it to the first request.
  const app = new App({
    token: env.SLACK_BOT_TOKEN,
    receiver,
    tokenVerificationEnabled: false,
  });
  registerOfficePresenceHandlers(app, appConfig, previewReminder);

  let cachedMembers: { expiresAt: number; members: DirectoryUser[] } | null =
    null;
  // The demo UI may act as any workspace member; a Slack outage just hides them.
  const listWorkspaceMembers = async (): Promise<DirectoryUser[]> => {
    if (cachedMembers && cachedMembers.expiresAt > Date.now()) {
      return cachedMembers.members;
    }
    try {
      const workspaceUsers = await Promise.race([
        SlackUtils.getAllRealUsers(app.client),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('users.list timed out')),
            MEMBER_LIST_TIMEOUT_MS,
          ).unref(),
        ),
      ]);
      const members = workspaceUsers.map(member => ({
        id: member.id as string,
        realName: member.real_name || member.name || (member.id as string),
        title: member.profile?.title || 'Workspace member',
        color: colorFor(member.id as string),
        isAdmin: member.is_admin === true || member.is_owner === true,
      }));
      cachedMembers = { expiresAt: Date.now() + MEMBER_CACHE_MS, members };
      return members;
    } catch (error) {
      console.error('[slack] could not list workspace members', error);
      // Back off for the cache window so every demo call doesn't wait out the timeout.
      const stale = cachedMembers?.members ?? [];
      cachedMembers = {
        expiresAt: Date.now() + MEMBER_CACHE_MS,
        members: stale,
      };
      return stale;
    }
  };

  return {
    appConfig,
    handleSlackRequest: handleRequest,
    sendReminders,
    listWorkspaceMembers,
  };
}
