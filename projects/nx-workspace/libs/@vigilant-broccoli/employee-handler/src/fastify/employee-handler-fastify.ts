import fs from 'fs';
import { z } from 'zod/v4';
import Fastify, { FastifyInstance, FastifyReply, HTTPMethods } from 'fastify';
import { EmployeeHandlerConfig } from '../employee-handler/employee-handler.models';
import { EmployeeHandlerService } from '../employee-handler/employee-handler.service';
import { ZIPPED_GENERATED_SIGNATURES_FILEPATH } from '../employee-handler/active-maintenance/signatures.const';
import {
  API_BASE_PATH,
  EMPLOYEE_HANDLER_ROUTES,
  EmployeeHandlerRouteBody,
  EmployeeHandlerRouteId,
  EmployeeHandlerRouteResponse,
  ZIP_CONTENT_TYPE,
} from '../employee-handler/employee-handler.contract';
import { createEmployeeHandlerOpenApiSpec } from '../employee-handler/employee-handler.openapi';
import {
  createSignatureTemplatesStore,
  SignatureTemplate,
} from '../employee-handler/signature-templates/signature-templates.store';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';

export type EmployeeHandlerAppOptions = {
  apiKey?: string;
  defaultTemplates?: SignatureTemplate[];
};

const OPENAPI_PATH = '/openapi.json';
const BODY_LIMIT_BYTES = 1024 * 1024;
const POISONING_ACTION = 'error';
const ERROR_UNAUTHORIZED = 'Unauthorized';
const ZIP_FILENAME_HEADER = 'attachment; filename="signatures.zip"';
const ERROR_ZIP_FAILED = 'Failed to generate signatures zip';
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';

type HandlerArgs<Id extends EmployeeHandlerRouteId> = {
  body: EmployeeHandlerRouteBody<Id>;
  params: Record<string, string>;
  reply: FastifyReply;
};

// A handler that sends its own response returns the reply it sent on.
type RouteHandler<Id extends EmployeeHandlerRouteId> = (
  args: HandlerArgs<Id>,
) => Promise<EmployeeHandlerRouteResponse<Id> | FastifyReply | void>;

type RouteHandlers = { [Id in EmployeeHandlerRouteId]: RouteHandler<Id> };

const formatIssues = (error: z.ZodError): string =>
  error.issues
    .map(issue => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    .join(', ');

const mountRoute = <Id extends EmployeeHandlerRouteId>(
  app: FastifyInstance,
  id: Id,
  handler: RouteHandler<Id>,
) => {
  const route: {
    method: string;
    path: string;
    status: number;
    body?: z.ZodType;
  } = EMPLOYEE_HANDLER_ROUTES[id];
  app.route({
    method: route.method as HTTPMethods,
    url: `${API_BASE_PATH}${route.path}`,
    handler: async (request, reply) => {
      const parsed = route.body
        ? route.body.safeParse(request.body ?? {})
        : undefined;
      if (parsed && !parsed.success) {
        return reply
          .code(HTTP_STATUS_CODES.BAD_REQUEST)
          .send({ error: formatIssues(parsed.error) });
      }
      const result = await handler({
        body: parsed?.data as EmployeeHandlerRouteBody<Id>,
        params: request.params as Record<string, string>,
        reply,
      });
      if (result === reply) return reply;
      return reply.code(route.status).send(result);
    },
  });
};

const createHandlers = (
  config: EmployeeHandlerConfig,
  store: ReturnType<typeof createSignatureTemplatesStore>,
): RouteHandlers => {
  const { onboardUtilities, activeMaintenanceUtilities, offboardUtilities } =
    config;
  const notFound = (reply: FastifyReply) =>
    reply.code(HTTP_STATUS_CODES.INVALID_PATH).send();
  return {
    employeesIncoming: async () => ({
      employees: await onboardUtilities.fetchIncomingEmployees(),
    }),
    employeesActive: async () => ({
      employees: await activeMaintenanceUtilities.fetchEmailSignatures(),
    }),
    employeesInactive: async () => ({
      employees: await offboardUtilities.fetchInactiveEmployees(),
    }),
    employeesMetadata: async ({ body, reply }) => {
      const { email, ...updates } = body;
      const employee = await config.updateEmployeeMetadata?.(email, updates);
      if (!employee) return notFound(reply);
      return { employee } as EmployeeHandlerRouteResponse<'employeesMetadata'>;
    },
    absences: async () => ({
      absences: await config.absenceUtilities.fetchAbsences(),
    }),
    onboard: () => EmployeeHandlerService.onboardIncomingEmployees(config),
    manualOnboard: ({ body }) => {
      type ProcessIncomingArgs = Parameters<
        typeof onboardUtilities.processIncomingEmployees
      >[0];
      const users = body.emails.map(email => ({
        email,
      })) as ProcessIncomingArgs;
      return onboardUtilities.processIncomingEmployees(users);
    },
    offboard: () => EmployeeHandlerService.offboardInactiveEmployees(config),
    manualOffboard: ({ body }) =>
      EmployeeHandlerService.manualOffboardEmails(config, body.emails),
    recover: ({ body }) => activeMaintenanceUtilities.recoverUsers(body.emails),
    sync: () => EmployeeHandlerService.syncData(config),
    birthdaysSync: () => EmployeeHandlerService.syncBirthdays(config),
    leavesSync: () => EmployeeHandlerService.syncLeaves(config),
    postRetentionCleanup: () =>
      EmployeeHandlerService.postRetentionCleanup(config),
    signatureList: async () => ({
      signatures: await activeMaintenanceUtilities.fetchEmailSignatures(),
    }),
    signatureUpdate: ({ body }) =>
      activeMaintenanceUtilities.processEmailSignatures([
        { email: body.email, signatureString: body.template },
      ]),
    signatureUpdateAll: async ({ body }) => {
      const signatures =
        await activeMaintenanceUtilities.fetchEmailSignatures();
      await activeMaintenanceUtilities.processEmailSignatures(
        signatures.map(sig => ({ ...sig, signatureString: body.template })),
      );
    },
    signatureUpdateEmailSignatures: () =>
      EmployeeHandlerService.updateEmailSignatures(config),
    signatureEmailZipped: ({ body }) =>
      EmployeeHandlerService.emailZippedSignatures(config, body.emails),
    signatureDownloadZipped: async ({ reply }) => {
      await EmployeeHandlerService.generateLocalSignatures(config);
      if (!fs.existsSync(ZIPPED_GENERATED_SIGNATURES_FILEPATH)) {
        return reply
          .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_ZIP_FAILED });
      }
      return reply
        .header(CONTENT_DISPOSITION_HEADER, ZIP_FILENAME_HEADER)
        .header(CONTENT_TYPE_HEADER, ZIP_CONTENT_TYPE)
        .send(fs.createReadStream(ZIPPED_GENERATED_SIGNATURES_FILEPATH));
    },
    signatureTemplatesList: async () => ({ templates: store.list() }),
    signatureTemplatesCreate: async ({ body }) => store.create(body),
    signatureTemplatesUpdate: async ({ body, params, reply }) => {
      const updated = store.update(params.id, body);
      if (!updated) return notFound(reply);
      return updated;
    },
    signatureTemplatesDelete: async ({ params, reply }) => {
      if (!store.delete(params.id)) return notFound(reply);
    },
  };
};

export const createEmployeeHandlerApp = (
  config: EmployeeHandlerConfig,
  options: EmployeeHandlerAppOptions = {},
): FastifyInstance => {
  const { apiKey, defaultTemplates = [] } = options;
  const store = createSignatureTemplatesStore(defaultTemplates);

  // Trailing slashes are ignored, as Express's router did.
  const app = Fastify({
    bodyLimit: BODY_LIMIT_BYTES,
    routerOptions: { ignoreTrailingSlash: true },
  });

  // Fastify rejects an empty JSON body with 400; Express's json() let bodyless routes run.
  const parseJson = app.getDefaultJsonParser(
    POISONING_ACTION,
    POISONING_ACTION,
  );
  app.removeContentTypeParser(JSON_CONTENT_TYPE);
  app.addContentTypeParser(
    JSON_CONTENT_TYPE,
    { parseAs: 'string' },
    (request, body: string, done) =>
      body === '' ? done(null, undefined) : parseJson(request, body, done),
  );

  if (apiKey) {
    app.addHook('onRequest', async (request, reply) => {
      if (request.headers[API_KEY_HEADER] !== apiKey) {
        return reply
          .code(HTTP_STATUS_CODES.UNAUTHORIZED)
          .send({ error: ERROR_UNAUTHORIZED });
      }
    });
  }

  app.get(`${API_BASE_PATH}${OPENAPI_PATH}`, async () =>
    createEmployeeHandlerOpenApiSpec(),
  );

  const handlers = createHandlers(config, store);
  (Object.keys(handlers) as EmployeeHandlerRouteId[]).forEach(id =>
    mountRoute(app, id, handlers[id] as RouteHandler<typeof id>),
  );

  app.get('/', async () => ({ status: 'ok' }));

  return app;
};
