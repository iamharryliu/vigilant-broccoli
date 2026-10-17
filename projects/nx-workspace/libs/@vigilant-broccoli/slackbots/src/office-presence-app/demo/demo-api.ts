import { registerOfficePresenceHandlers } from '../office-presence-app';
import { APP_COMMAND } from '../consts/app.consts';
import {
  DEMO_BOT_NAME,
  DEMO_BOT_USER_ID,
  DEMO_USERS,
  DemoUser,
} from '../consts/demo-users.const';
import { loadUserSettings } from '../utils/db.utils';
import { AppConfig } from '../types';
import { createMockSlack, MockSlack } from '../mock/mock-slack';
import { SeedOptions, seedDemoData } from './demo-seed';

export const DEMO_OPERATION = {
  STATE: 'state',
  ACTION: 'action',
  SUBMIT: 'submit',
  CLOSE_MODAL: 'close-modal',
  PREVIEW_REMINDER: 'preview-reminder',
  RESET: 'reset',
} as const;
export type DemoOperation =
  (typeof DEMO_OPERATION)[keyof typeof DEMO_OPERATION];

export const DEMO_SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

const DEFAULT_SESSION_TTL_MS = 30 * 60 * 1000;
const DEFAULT_MAX_SESSIONS = 200;
const FALLBACK_SESSION_ID = 'local';

export class DemoApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

// A seeded member always has a home office; a real workspace member may not.
export type DirectoryUser = Omit<DemoUser, 'homeOffice'> & {
  homeOffice?: string;
};

type JsonBody = Record<string, unknown>;
type ViewState = { values: Record<string, Record<string, unknown>> };
type Session = { slack: MockSlack; lastSeen: number };

export type DemoApiOptions = {
  appConfig: AppConfig;
  seed: Omit<SeedOptions, 'includeCurrentWeek' | 'now'>;
  // Workspace members the visitor may also act as; failures must resolve to [].
  listRealUsers?: () => Promise<DirectoryUser[]>;
  sessionTtlMs?: number;
  maxSessions?: number;
};

// Everything the visitor sees through `createMockSlack` (home view, modals,
// messages, group chats) lives in an in-memory session. Only presences, events
// and settings reach the shared database, through the real handlers.
export function createDemoApi({
  appConfig,
  seed,
  listRealUsers,
  sessionTtlMs = DEFAULT_SESSION_TTL_MS,
  maxSessions = DEFAULT_MAX_SESSIONS,
}: DemoApiOptions) {
  const sessions = new Map<string, Session>();
  const users = new Map<string, DirectoryUser>();

  const refreshUsers = async () => {
    users.clear();
    [...DEMO_USERS, ...((await listRealUsers?.()) ?? [])].forEach(user =>
      users.set(user.id, user),
    );
  };

  const createSession = (): Session => {
    const slack = createMockSlack({
      nameOf: userId => users.get(userId)?.realName ?? userId,
      isAdmin: userId => users.get(userId)?.isAdmin,
    });
    registerOfficePresenceHandlers(
      slack.app,
      appConfig,
      async userId => {
        const copy = appConfig.getCopy(loadUserSettings(userId).language);
        await slack.sendMessage({
          channel: userId,
          text: copy.getReminderDmText(appConfig.APP_NAME, DEMO_BOT_USER_ID),
        });
      },
      { allowDemoRecipients: true },
    );
    return { slack, lastSeen: Date.now() };
  };

  const getSession = (sessionId: string): MockSlack => {
    const now = Date.now();
    sessions.forEach((session, id) => {
      if (now - session.lastSeen > sessionTtlMs) sessions.delete(id);
    });
    const session = sessions.get(sessionId) ?? createSession();
    session.lastSeen = now;
    // Re-insert so the Map's first entry is always the least recently used.
    sessions.delete(sessionId);
    sessions.set(sessionId, session);
    if (sessions.size > maxSessions) {
      sessions.delete(sessions.keys().next().value as string);
    }
    return session.slack;
  };

  const snapshot = (slack: MockSlack, userId: string) => ({
    appName: appConfig.APP_NAME,
    botUserId: DEMO_BOT_USER_ID,
    users: [
      ...users.values(),
      { id: DEMO_BOT_USER_ID, realName: DEMO_BOT_NAME, title: 'App' },
    ],
    home: slack.getHome(userId),
    modals: slack.getModals(userId),
    messages: slack.getMessages(userId),
  });

  const resolveUser = (body: JsonBody): string => {
    const userId = String(body.user ?? DEMO_USERS[0].id);
    if (!users.has(userId)) {
      throw new DemoApiError(400, `Unknown user: ${userId}`);
    }
    return userId;
  };

  const resolveSessionId = (sessionId?: string): string => {
    if (sessionId === undefined) return FALLBACK_SESSION_ID;
    if (!DEMO_SESSION_ID_PATTERN.test(sessionId)) {
      throw new DemoApiError(400, 'Invalid session id');
    }
    return sessionId;
  };

  const reseed = () => seedDemoData({ ...seed, includeCurrentWeek: true });

  const handle = async (
    operation: DemoOperation,
    body: JsonBody,
    sessionId?: string,
  ) => {
    await refreshUsers();
    const slack = getSession(resolveSessionId(sessionId));
    const userId = resolveUser(body);
    switch (operation) {
      case DEMO_OPERATION.STATE:
        await slack.openHome(userId);
        break;
      case DEMO_OPERATION.ACTION:
        await slack.triggerAction(userId, body.action as { action_id: string });
        break;
      case DEMO_OPERATION.SUBMIT:
        await slack.submitView(
          userId,
          String(body.callbackId),
          body.state as ViewState,
        );
        break;
      case DEMO_OPERATION.CLOSE_MODAL:
        slack.closeTopModal(userId);
        break;
      case DEMO_OPERATION.PREVIEW_REMINDER:
        await slack.runCommand(userId, APP_COMMAND.PREVIEW_REMINDER);
        break;
      case DEMO_OPERATION.RESET:
        slack.reset();
        reseed();
        await slack.openHome(userId);
        break;
    }
    return snapshot(slack, userId);
  };

  return { handle, reseed };
}

export type DemoApi = ReturnType<typeof createDemoApi>;
