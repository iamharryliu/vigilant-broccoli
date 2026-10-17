import { createSwaggerSpec } from '@vigilant-broccoli/fastify';
import { DEMO_OPERATION } from '@vigilant-broccoli/slackbots';
import {
  DEMO_ROUTE_PREFIX,
  DEMO_SESSION_HEADER,
  INTERNAL_ROUTE,
  SERVICE_NAME,
  SLACK_ROUTE,
} from './routes.consts';

const SERVICE_DESCRIPTION =
  'Office Presence Slack app in HTTP (Events API) mode. /slack/* receives signed Slack requests; /demo/* backs the browser demo UI (only when DEMO_MODE=true); /internal/* is for schedulers and needs the bearer token. The demo routes are absent in Socket Mode, which exposes no HTTP surface.';

const JSON_CONTENT = 'application/json';
const FORM_CONTENT = 'application/x-www-form-urlencoded';
const BEARER_SCHEME = 'BearerAuth';
const SLACK_SIGNATURE_SCHEME = 'SlackSignature';

const jsonBody = (schema: unknown, required = true) => ({
  required,
  content: { [JSON_CONTENT]: { schema } },
});

const jsonResponse = (description: string, schema?: unknown) => ({
  description,
  ...(schema ? { content: { [JSON_CONTENT]: { schema } } } : {}),
});

const errorSchema = {
  type: 'object',
  properties: { error: { type: 'string' } },
};

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    realName: { type: 'string' },
    title: { type: 'string' },
    color: { type: 'string' },
    homeOffice: { type: 'string' },
    isAdmin: { type: 'boolean' },
  },
};

const snapshotSchema = {
  type: 'object',
  description:
    "The visitor's session after the call: Block Kit home view, modal stack and message transcript.",
  properties: {
    appName: { type: 'string' },
    botUserId: { type: 'string' },
    users: { type: 'array', items: userSchema },
    home: { type: 'object', nullable: true },
    modals: { type: 'array', items: { type: 'object' } },
    messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          text: { type: 'string' },
          channelLabel: { type: 'string' },
          ephemeral: { type: 'boolean' },
        },
      },
    },
  },
};

const sessionParameter = {
  name: DEMO_SESSION_HEADER,
  in: 'header',
  required: false,
  description:
    "Random id (16-64 chars of A-Z a-z 0-9 _ -) kept in the visitor's localStorage. Scopes the in-memory home view, modals and messages; omitted ids share one anonymous session.",
  schema: { type: 'string', pattern: '^[A-Za-z0-9_-]{16,64}$' },
};

const userProperty = {
  user: {
    type: 'string',
    description:
      'Seeded (U_DEMO_*) or workspace member id to act as. Unknown ids are rejected with 400.',
  },
};

const demoOperation = (
  summary: string,
  extraProperties: Record<string, unknown> = {},
  required: string[] = [],
  resetNote = '',
) => ({
  post: {
    summary,
    description: `Enabled only when SLACK_MODE=http and DEMO_MODE=true. CORS allows only the demo UI origin.${resetNote}`,
    parameters: [sessionParameter],
    requestBody: jsonBody(
      {
        type: 'object',
        required,
        properties: { ...userProperty, ...extraProperties },
      },
      false,
    ),
    responses: {
      200: jsonResponse('Session snapshot', snapshotSchema),
      400: jsonResponse('Unknown user or invalid session id', errorSchema),
      413: jsonResponse('Request body over 32 KB'),
      429: jsonResponse('Rate limit exceeded'),
    },
  },
});

const slackOperation = (summary: string, contentType: string) => ({
  post: {
    summary,
    description:
      'Verified with the Slack signing secret over the raw body; requests older than five minutes are rejected. Retries (X-Slack-Retry-Num) are acknowledged and ignored so a slow handler never runs twice.',
    security: [{ [SLACK_SIGNATURE_SCHEME]: [] }],
    requestBody: {
      required: true,
      content: { [contentType]: { schema: { type: 'object' } } },
    },
    responses: {
      200: jsonResponse('Acknowledged'),
      400: jsonResponse('Malformed body'),
      401: jsonResponse('Invalid or missing Slack signature'),
    },
  },
});

const internalOperation = (
  summary: string,
  description: string,
  requestBody?: unknown,
) => ({
  post: {
    summary,
    description,
    security: [{ [BEARER_SCHEME]: [] }],
    ...(requestBody ? { requestBody } : {}),
    responses: {
      200: jsonResponse('Done', {
        type: 'object',
        properties: { ok: { type: 'boolean' } },
      }),
      401: jsonResponse('Missing or wrong bearer token', errorSchema),
      429: jsonResponse('Rate limit exceeded'),
    },
  },
});

const spec = createSwaggerSpec({
  title: SERVICE_NAME,
  description: SERVICE_DESCRIPTION,
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        security: [],
        responses: {
          200: jsonResponse('Service name and docs path', {
            type: 'object',
            properties: {
              service: { type: 'string' },
              docs: { type: 'string' },
            },
          }),
        },
      },
    },
    [SLACK_ROUTE.EVENTS]: slackOperation(
      'Slack Events API (also answers url_verification)',
      JSON_CONTENT,
    ),
    [SLACK_ROUTE.INTERACTIVITY]: slackOperation(
      'Slack interactivity (block actions, view submissions)',
      FORM_CONTENT,
    ),
    [SLACK_ROUTE.COMMANDS]: slackOperation(
      'Slack slash commands',
      FORM_CONTENT,
    ),
    [`${DEMO_ROUTE_PREFIX}/${DEMO_OPERATION.STATE}`]: demoOperation(
      "Open the visitor's Home tab",
    ),
    [`${DEMO_ROUTE_PREFIX}/${DEMO_OPERATION.ACTION}`]: demoOperation(
      'Trigger a block action',
      {
        action: {
          type: 'object',
          required: ['action_id'],
          properties: { action_id: { type: 'string' } },
        },
      },
      ['action'],
    ),
    [`${DEMO_ROUTE_PREFIX}/${DEMO_OPERATION.SUBMIT}`]: demoOperation(
      'Submit the open modal',
      {
        callbackId: { type: 'string' },
        state: { type: 'object' },
      },
      ['callbackId', 'state'],
    ),
    [`${DEMO_ROUTE_PREFIX}/${DEMO_OPERATION.CLOSE_MODAL}`]: demoOperation(
      'Close the top modal',
    ),
    [`${DEMO_ROUTE_PREFIX}/${DEMO_OPERATION.PREVIEW_REMINDER}`]: demoOperation(
      'Run the /preview-reminder command into the visitor transcript',
    ),
    [`${DEMO_ROUTE_PREFIX}/${DEMO_OPERATION.RESET}`]: demoOperation(
      'Reset demo data',
      {},
      [],
      ' Reseeds only the seeded (U_DEMO_*) rows for the current and coming week and clears this visitor session; limited to 5 requests per minute.',
    ),
    [INTERNAL_ROUTE.SEED]: internalOperation(
      'Replace seeded presences for the coming week',
      'Enabled only when DEMO_MODE=true. Idempotently replaces seeded rows for the coming week (weekend setting and reminder timezone decide the boundaries) and removes seeded rows older than the current week. Rows of real members are never deleted.',
      jsonBody(
        {
          type: 'object',
          properties: {
            includeCurrentWeek: {
              type: 'boolean',
              description: 'Also reseed the week containing today.',
            },
          },
        },
        false,
      ),
    ),
    [INTERNAL_ROUTE.REMINDERS]: internalOperation(
      'Send the reminder DMs',
      'Same as the Socket Mode cron job, for an external scheduler. Nothing in the demo calls it.',
    ),
  },
});

export const swaggerSpec = {
  ...spec,
  components: {
    securitySchemes: {
      [BEARER_SCHEME]: { type: 'http', scheme: 'bearer' },
      [SLACK_SIGNATURE_SCHEME]: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Slack-Signature',
      },
    },
  },
};
