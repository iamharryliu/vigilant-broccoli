import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  OfficePresenceAppRunConfig,
  createAppConfig,
  registerOfficePresenceHandlers,
} from '../office-presence-app';
import { loadUserSettings } from '../utils/db.utils';
import { createMockSlack } from './mock-slack';
import { seedMockData } from './mock-seed';
import { MOCK_UI_HTML } from './mock-ui';
import {
  MOCK_BOT_NAME,
  MOCK_BOT_USER_ID,
  MOCK_OFFICES,
  MOCK_USERS,
} from './mock-users.const';
import { APP_COMMAND } from '../consts/app.consts';

const DEFAULT_MOCK_PORT = 3100;
const IN_MEMORY_DB = ':memory:';

type JsonBody = Record<string, unknown>;

const readJson = async (req: IncomingMessage): Promise<JsonBody> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString();
  return raw ? JSON.parse(raw) : {};
};

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

export async function runOfficePresenceMock(
  config: OfficePresenceAppRunConfig = {},
) {
  if (process.env.OFFICE_PRESENCE_DB !== IN_MEMORY_DB) {
    throw new Error(
      `The mock must run with OFFICE_PRESENCE_DB=${IN_MEMORY_DB} so it never writes the real state.db.`,
    );
  }
  const appConfig = createAppConfig({ OFFICES: MOCK_OFFICES, ...config });
  const slack = createMockSlack();
  registerOfficePresenceHandlers(slack.app, appConfig, async userId => {
    const copy = appConfig.getCopy(loadUserSettings(userId).language);
    await slack.sendMessage({
      channel: userId,
      text: copy.getReminderDmText(appConfig.APP_NAME, MOCK_BOT_USER_ID),
    });
  });
  seedMockData();

  const snapshot = (userId: string) => ({
    appName: appConfig.APP_NAME,
    botUserId: MOCK_BOT_USER_ID,
    users: [
      ...MOCK_USERS,
      { id: MOCK_BOT_USER_ID, realName: MOCK_BOT_NAME, title: 'App' },
    ],
    home: slack.getHome(userId),
    modals: slack.getModals(userId),
    messages: slack.getMessages(userId),
  });

  const handleApi = async (path: string, body: JsonBody) => {
    const userId = String(body.user ?? MOCK_USERS[0].id);
    switch (path) {
      case '/api/state':
        await slack.openHome(userId);
        break;
      case '/api/action':
        await slack.triggerAction(userId, body.action as { action_id: string });
        break;
      case '/api/submit':
        await slack.submitView(
          userId,
          String(body.callbackId),
          body.state as { values: Record<string, Record<string, unknown>> },
        );
        break;
      case '/api/close-modal':
        slack.closeTopModal(userId);
        break;
      case '/api/preview-reminder':
        await slack.runCommand(userId, APP_COMMAND.PREVIEW_REMINDER);
        break;
      case '/api/reset':
        slack.reset();
        seedMockData();
        await slack.openHome(userId);
        break;
      default:
        return null;
    }
    return snapshot(userId);
  };

  const server = createServer(async (req, res) => {
    const path = (req.url ?? '/').split('?')[0];
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(MOCK_UI_HTML);
      return;
    }
    try {
      const result = await handleApi(path, await readJson(req));
      if (result) sendJson(res, 200, result);
      else sendJson(res, 404, { error: `Not found: ${path}` });
    } catch (error) {
      console.error('[mock]', error);
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  const port = config.port ?? DEFAULT_MOCK_PORT;
  await new Promise<void>(resolve => server.listen(port, resolve));
  console.log(
    `⚡️ ${appConfig.APP_NAME} mock is running at http://localhost:${port}`,
  );
}
