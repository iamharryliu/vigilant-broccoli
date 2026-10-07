import fs from 'fs';
import { z } from 'zod/v4';
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
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
} from '@vigilant-broccoli/common-js';

export type EmployeeHandlerAppOptions = {
  apiKey?: string;
  defaultTemplates?: SignatureTemplate[];
};

const OPENAPI_PATH = '/openapi.json';
const ERROR_UNAUTHORIZED = 'Unauthorized';
const ZIP_FILENAME_HEADER = 'attachment; filename="signatures.zip"';
const ERROR_ZIP_FAILED = 'Failed to generate signatures zip';
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';

type HandlerArgs<Id extends EmployeeHandlerRouteId> = {
  body: EmployeeHandlerRouteBody<Id>;
  params: Record<string, string>;
  res: Response;
};

type RouteHandler<Id extends EmployeeHandlerRouteId> = (
  args: HandlerArgs<Id>,
) => Promise<EmployeeHandlerRouteResponse<Id> | void>;

type RouteHandlers = { [Id in EmployeeHandlerRouteId]: RouteHandler<Id> };

const formatIssues = (error: z.ZodError): string =>
  error.issues
    .map(issue => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    .join(', ');

const mountRoute = <Id extends EmployeeHandlerRouteId>(
  router: Router,
  id: Id,
  handler: RouteHandler<Id>,
) => {
  const route: {
    method: string;
    path: string;
    status: number;
    body?: z.ZodType;
  } = EMPLOYEE_HANDLER_ROUTES[id];
  const method = route.method.toLowerCase() as
    'get' | 'post' | 'patch' | 'delete';
  router[method](
    route.path,
    (req: Request, res: Response, next: NextFunction) => {
      const parsed = route.body
        ? route.body.safeParse(req.body ?? {})
        : undefined;
      if (parsed && !parsed.success) {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: formatIssues(parsed.error) });
        return;
      }
      handler({
        body: parsed?.data as EmployeeHandlerRouteBody<Id>,
        params: req.params as Record<string, string>,
        res,
      })
        .then(result => {
          if (res.headersSent || res.writableEnded) return;
          if (result === undefined) {
            res.status(route.status).end();
            return;
          }
          res.status(route.status).json(result);
        })
        .catch(next);
    },
  );
};

const createHandlers = (
  config: EmployeeHandlerConfig,
  store: ReturnType<typeof createSignatureTemplatesStore>,
): RouteHandlers => {
  const { onboardUtilities, activeMaintenanceUtilities, offboardUtilities } =
    config;
  const notFound = (res: Response) => {
    res.status(HTTP_STATUS_CODES.INVALID_PATH).end();
  };
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
    employeesMetadata: async ({ body, res }) => {
      const { email, ...updates } = body;
      const employee = await config.updateEmployeeMetadata?.(email, updates);
      if (!employee) return notFound(res);
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
    signatureDownloadZipped: async ({ res }) => {
      await EmployeeHandlerService.generateLocalSignatures(config);
      if (!fs.existsSync(ZIPPED_GENERATED_SIGNATURES_FILEPATH)) {
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ error: ERROR_ZIP_FAILED });
        return;
      }
      res.setHeader(CONTENT_DISPOSITION_HEADER, ZIP_FILENAME_HEADER);
      res.setHeader(CONTENT_TYPE_HEADER, ZIP_CONTENT_TYPE);
      fs.createReadStream(ZIPPED_GENERATED_SIGNATURES_FILEPATH).pipe(res);
    },
    signatureTemplatesList: async () => ({ templates: store.list() }),
    signatureTemplatesCreate: async ({ body }) => store.create(body),
    signatureTemplatesUpdate: async ({ body, params, res }) => {
      const updated = store.update(params.id, body);
      if (!updated) return notFound(res);
      return updated;
    },
    signatureTemplatesDelete: async ({ params, res }) => {
      if (!store.delete(params.id)) notFound(res);
    },
  };
};

export const createEmployeeHandlerApp = (
  config: EmployeeHandlerConfig,
  options: EmployeeHandlerAppOptions = {},
): Application => {
  const { apiKey, defaultTemplates = [] } = options;
  const store = createSignatureTemplatesStore(defaultTemplates);

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  if (apiKey) {
    app.use((req, res, next) => {
      if (req.headers[API_KEY_HEADER] !== apiKey) {
        res
          .status(HTTP_STATUS_CODES.UNAUTHORIZED)
          .json({ error: ERROR_UNAUTHORIZED });
        return;
      }
      next();
    });
  }

  const api = Router();
  api.get(OPENAPI_PATH, (_req, res) => {
    res.json(createEmployeeHandlerOpenApiSpec());
  });

  const handlers = createHandlers(config, store);
  (Object.keys(handlers) as EmployeeHandlerRouteId[]).forEach(id =>
    mountRoute(api, id, handlers[id] as RouteHandler<typeof id>),
  );

  app.use(API_BASE_PATH, api);
  app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};
