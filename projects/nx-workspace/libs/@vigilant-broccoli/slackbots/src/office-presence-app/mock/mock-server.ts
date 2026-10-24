import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  OfficePresenceAppRunConfig,
  createAppConfig,
} from '../office-presence-app';
import { DEMO_OFFICES } from '../consts/demo-users.const';
import {
  DEMO_OPERATION,
  DemoApiError,
  DemoOperation,
  createDemoApi,
} from '../demo/demo-api';
import { MOCK_UI_HTML } from './mock-ui';

const DEFAULT_MOCK_PORT = 3100;
const IN_MEMORY_DB = ':memory:';
const API_PREFIX = '/api/';

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

const isOperation = (value: string): value is DemoOperation =>
  (Object.values(DEMO_OPERATION) as string[]).includes(value);

export async function runOfficePresenceMock(
  config: OfficePresenceAppRunConfig = {},
) {
  if (process.env.OFFICE_PRESENCE_DB !== IN_MEMORY_DB) {
    throw new Error(
      `The mock must run with OFFICE_PRESENCE_DB=${IN_MEMORY_DB} so it never writes the real state.db.`,
    );
  }
  const appConfig = createAppConfig({ OFFICES: DEMO_OFFICES, ...config });
  // One browser, one session: the page sends no session id.
  const demo = createDemoApi({
    appConfig,
    seed: {
      timeZone: appConfig.timeZone,
      includeWeekends: appConfig.includeWeekends,
    },
  });
  demo.reseed();

  const server = createServer(async (req, res) => {
    const path = (req.url ?? '/').split('?')[0];
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(MOCK_UI_HTML);
      return;
    }
    const operation = path.startsWith(API_PREFIX)
      ? path.slice(API_PREFIX.length)
      : '';
    if (!isOperation(operation)) {
      sendJson(res, 404, { error: `Not found: ${path}` });
      return;
    }
    try {
      sendJson(res, 200, await demo.handle(operation, await readJson(req)));
    } catch (error) {
      if (error instanceof DemoApiError) {
        sendJson(res, error.statusCode, { error: error.message });
        return;
      }
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
