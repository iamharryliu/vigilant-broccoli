import { View } from '@slack/types';
import { OfficePresenceHandlerApp } from '../office-presence-app';
import { MOCK_BOT_USER_ID, MOCK_USERS } from './mock-users.const';

export type MockMessage = {
  id: number;
  text: string;
  channelLabel: string;
  ephemeral: boolean;
};

type HandlerKind = 'event' | 'action' | 'view' | 'command';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockHandler = (args: any) => Promise<void> | void;
type Registration = {
  kind: HandlerKind;
  matcher: string | RegExp;
  handler: MockHandler;
};

type ViewState = { values: Record<string, Record<string, unknown>> };

const TRIGGER_PREFIX = 'mock-trigger:';
const GROUP_PREFIX = 'G_MOCK_';

const matches = (matcher: string | RegExp, value: string) =>
  typeof matcher === 'string' ? matcher === value : matcher.test(value);

const nameOf = (userId: string) =>
  MOCK_USERS.find(u => u.id === userId)?.realName ?? userId;

// Stands in for Bolt's `App` and Slack's `WebClient` so the real handlers run
// unchanged; the mock only records what the app would have sent to Slack.
export function createMockSlack() {
  const registrations: Registration[] = [];
  const homes = new Map<string, View>();
  const modals = new Map<string, View[]>();
  const messages = new Map<string, MockMessage[]>();
  const groups = new Map<string, string[]>();
  let nextMessageId = 1;

  const register =
    (kind: HandlerKind) => (matcher: string | RegExp, handler: MockHandler) => {
      registrations.push({ kind, matcher, handler });
    };

  const app = {
    event: register('event'),
    action: register('action'),
    view: register('view'),
    command: register('command'),
  } as unknown as OfficePresenceHandlerApp;

  const deliver = (userId: string, message: Omit<MockMessage, 'id'>) => {
    messages.set(userId, [
      { ...message, id: nextMessageId++ },
      ...(messages.get(userId) ?? []),
    ]);
  };

  const userFromTrigger = (triggerId: string) =>
    triggerId.slice(TRIGGER_PREFIX.length);

  const client = {
    views: {
      publish: async ({ user_id, view }: { user_id: string; view: View }) => {
        homes.set(user_id, view);
      },
      open: async ({
        trigger_id,
        view,
      }: {
        trigger_id: string;
        view: View;
      }) => {
        modals.set(userFromTrigger(trigger_id), [view]);
      },
      push: async ({
        trigger_id,
        view,
      }: {
        trigger_id: string;
        view: View;
      }) => {
        const userId = userFromTrigger(trigger_id);
        modals.set(userId, [...(modals.get(userId) ?? []), view]);
      },
    },
    chat: {
      postMessage: async ({
        channel,
        text,
      }: {
        channel: string;
        text: string;
      }) => {
        const members = groups.get(channel);
        if (members) {
          const channelLabel = `Group chat: ${members.map(nameOf).join(', ')}`;
          members.forEach(userId =>
            deliver(userId, { text, channelLabel, ephemeral: false }),
          );
          return;
        }
        deliver(channel, {
          text,
          channelLabel: 'Direct message',
          ephemeral: false,
        });
      },
      postEphemeral: async ({ user, text }: { user: string; text: string }) => {
        deliver(user, {
          text,
          channelLabel: 'Only visible to you',
          ephemeral: true,
        });
      },
    },
    conversations: {
      open: async ({ users }: { users: string }) => {
        const id = `${GROUP_PREFIX}${groups.size + 1}`;
        groups.set(id, users.split(','));
        return { channel: { id } };
      },
    },
    users: {
      info: async ({ user }: { user: string }) => ({
        user: { is_admin: MOCK_USERS.find(u => u.id === user)?.isAdmin },
      }),
    },
    auth: { test: async () => ({ user_id: MOCK_BOT_USER_ID }) },
  };

  const run = async (
    kind: HandlerKind,
    id: string,
    buildArgs: () => Record<string, unknown>,
  ) => {
    const handlers = registrations.filter(
      r => r.kind === kind && matches(r.matcher, id),
    );
    if (handlers.length === 0) {
      console.warn(`[mock] no ${kind} handler for "${id}"`);
    }
    for (const { handler } of handlers) {
      await handler({ ack: async () => undefined, client, ...buildArgs() });
    }
  };

  const triggerFor = (userId: string) => `${TRIGGER_PREFIX}${userId}`;

  return {
    app,
    getHome: (userId: string) => homes.get(userId) ?? null,
    getModals: (userId: string) => modals.get(userId) ?? [],
    getMessages: (userId: string) => messages.get(userId) ?? [],
    closeTopModal: (userId: string) =>
      modals.set(userId, (modals.get(userId) ?? []).slice(0, -1)),
    reset: () => {
      homes.clear();
      modals.clear();
      messages.clear();
      groups.clear();
    },
    sendMessage: client.chat.postMessage,
    openHome: (userId: string) =>
      run('event', 'app_home_opened', () => ({
        event: { type: 'app_home_opened', user: userId, tab: 'home' },
      })),
    triggerAction: (userId: string, action: { action_id: string }) =>
      run('action', action.action_id, () => ({
        body: {
          type: 'block_actions',
          user: { id: userId },
          trigger_id: triggerFor(userId),
          actions: [action],
        },
      })),
    submitView: async (
      userId: string,
      callbackId: string,
      state: ViewState,
    ) => {
      const view = { callback_id: callbackId, state };
      await run('view', callbackId, () => ({
        body: {
          type: 'view_submission',
          user: { id: userId },
          trigger_id: triggerFor(userId),
          view,
        },
        view,
      }));
      modals.set(userId, []);
    },
    runCommand: (userId: string, command: string) =>
      run('command', command, () => ({
        command: { command, user_id: userId, channel_id: userId },
      })),
  };
}

export type MockSlack = ReturnType<typeof createMockSlack>;
