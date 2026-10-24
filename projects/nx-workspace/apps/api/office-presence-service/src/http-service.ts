import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import cors from '@fastify/cors';
import {
  BEARER_PREFIX,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { isTimingSafeEqual } from '@vigilant-broccoli/common-node';
import {
  DOCS_PATH,
  createDocsPlugin,
  createRateLimitPlugin,
} from '@vigilant-broccoli/fastify';
import {
  DEMO_OPERATION,
  DemoApiError,
  DemoOperation,
  OfficePresenceAppRunConfig,
  SeedOptions,
  createDemoApi,
  createOfficePresenceHttpRuntime,
  seedDemoData,
  seedDemoDataIfEmpty,
} from '@vigilant-broccoli/slackbots';
import { swaggerSpec } from './libs/swagger';
import {
  DEMO_ROUTE_PREFIX,
  DEMO_SESSION_HEADER,
  INTERNAL_ROUTE,
  SERVICE_NAME,
  SLACK_ROUTE,
} from './libs/routes.consts';

const SLACK_BODY_LIMIT_BYTES = 1024 * 1024;
const DEMO_BODY_LIMIT_BYTES = 32 * 1024;
const INTERNAL_BODY_LIMIT_BYTES = 1024;
const DEMO_RATE_LIMIT = { max: 120, timeWindow: '1 minute' };
// Reseeding rewrites the database every visitor shares.
const DEMO_RESET_RATE_LIMIT = { max: 5, timeWindow: '1 minute' };
const INTERNAL_RATE_LIMIT = { max: 10, timeWindow: '1 minute' };

export type HttpServiceConfig = {
  appRunConfig: OfficePresenceAppRunConfig;
  demoMode: boolean;
  // Only these origins may call /demo/* from a browser.
  demoUiOrigins: string[];
  internalToken?: string;
  realUserIds: string[];
};

const splitList = (value?: string) =>
  (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

export const readHttpServiceConfig = (
  appRunConfig: OfficePresenceAppRunConfig,
  env: NodeJS.ProcessEnv = process.env,
): HttpServiceConfig => ({
  appRunConfig,
  demoMode: env.DEMO_MODE === 'true',
  demoUiOrigins: splitList(env.DEMO_UI_ORIGIN),
  internalToken: env.OFFICE_PRESENCE_INTERNAL_TOKEN,
  realUserIds: splitList(env.DEMO_REAL_USER_IDS),
});

const isBearerAuthorized = (req: FastifyRequest, token?: string) => {
  const header = req.headers.authorization;
  return (
    !!token &&
    typeof header === 'string' &&
    header.startsWith(BEARER_PREFIX) &&
    isTimingSafeEqual(header.slice(BEARER_PREFIX.length), token)
  );
};

const unauthorized = (reply: FastifyReply) =>
  reply.code(HTTP_STATUS_CODES.UNAUTHORIZED).send({ error: 'Unauthorized' });

export async function buildHttpService(
  config: HttpServiceConfig,
): Promise<FastifyInstance> {
  const { appRunConfig, demoMode, demoUiOrigins, internalToken, realUserIds } =
    config;
  if (demoMode && !internalToken) {
    throw new Error(
      'DEMO_MODE=true requires OFFICE_PRESENCE_INTERNAL_TOKEN to protect /internal/seed.',
    );
  }
  if (demoMode && demoUiOrigins.length === 0) {
    throw new Error(
      'DEMO_MODE=true requires DEMO_UI_ORIGIN (the demo UI origin).',
    );
  }

  const runtime = createOfficePresenceHttpRuntime(appRunConfig);
  const seedOptions: Omit<SeedOptions, 'includeCurrentWeek' | 'now'> = {
    timeZone: runtime.appConfig.timeZone,
    includeWeekends: runtime.appConfig.includeWeekends,
    realUserIds,
  };

  const app = Fastify({ bodyLimit: SLACK_BODY_LIMIT_BYTES, logger: false });
  await app.register(createRateLimitPlugin());
  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));
  app.get('/', async () => ({ service: SERVICE_NAME, docs: DOCS_PATH }));

  // Slack signs the exact bytes it sends, so these routes keep the body as a raw string.
  await app.register(async scope => {
    scope.addContentTypeParser(
      ['application/json', 'application/x-www-form-urlencoded'],
      { parseAs: 'string' },
      (_req, body, done) => done(null, body),
    );
    for (const path of Object.values(SLACK_ROUTE)) {
      scope.post(path, async (req, reply) => {
        const result = await runtime.handleSlackRequest({
          headers: req.headers,
          rawBody: typeof req.body === 'string' ? req.body : '',
        });
        if (result.contentType) reply.type(result.contentType);
        return reply.code(result.status).send(result.body ?? '');
      });
    }
  });

  await app.register(async scope => {
    scope.addHook('onRequest', async (req, reply) => {
      if (!isBearerAuthorized(req, internalToken)) return unauthorized(reply);
    });

    scope.post(
      INTERNAL_ROUTE.REMINDERS,
      {
        bodyLimit: INTERNAL_BODY_LIMIT_BYTES,
        config: { rateLimit: INTERNAL_RATE_LIMIT },
      },
      async () => {
        await runtime.sendReminders();
        return { ok: true };
      },
    );

    if (demoMode) {
      scope.post<{ Body?: { includeCurrentWeek?: boolean } }>(
        INTERNAL_ROUTE.SEED,
        {
          bodyLimit: INTERNAL_BODY_LIMIT_BYTES,
          config: { rateLimit: INTERNAL_RATE_LIMIT },
        },
        async req => {
          const result = seedDemoData({
            ...seedOptions,
            includeCurrentWeek: req.body?.includeCurrentWeek === true,
          });
          return { ok: true, ...result };
        },
      );
    }
  });

  if (demoMode) {
    seedDemoDataIfEmpty(seedOptions);
    const demo = createDemoApi({
      appConfig: runtime.appConfig,
      seed: seedOptions,
      listRealUsers: runtime.listWorkspaceMembers,
    });

    await app.register(
      async scope => {
        await scope.register(cors, {
          origin: demoUiOrigins,
          methods: [HTTP_METHOD.POST],
          allowedHeaders: ['content-type', DEMO_SESSION_HEADER],
          credentials: false,
        });
        for (const operation of Object.values(DEMO_OPERATION)) {
          scope.post<{ Body?: Record<string, unknown> }>(
            `/${operation}`,
            {
              bodyLimit: DEMO_BODY_LIMIT_BYTES,
              config: {
                rateLimit:
                  operation === DEMO_OPERATION.RESET
                    ? DEMO_RESET_RATE_LIMIT
                    : DEMO_RATE_LIMIT,
              },
            },
            async (req, reply) => {
              const session = req.headers[DEMO_SESSION_HEADER];
              try {
                return await demo.handle(
                  operation as DemoOperation,
                  req.body ?? {},
                  typeof session === 'string' ? session : undefined,
                );
              } catch (error) {
                if (error instanceof DemoApiError) {
                  return reply
                    .code(error.statusCode)
                    .send({ error: error.message });
                }
                throw error;
              }
            },
          );
        }
      },
      { prefix: DEMO_ROUTE_PREFIX },
    );
  }

  return app;
}
