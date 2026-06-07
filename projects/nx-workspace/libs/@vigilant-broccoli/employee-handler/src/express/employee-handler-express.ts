import fs from 'fs';
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
  createSignatureTemplatesStore,
  SignatureTemplate,
} from '../employee-handler/signature-templates/signature-templates.store';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

export type EmployeeHandlerAppOptions = {
  apiKey?: string;
  defaultTemplates?: SignatureTemplate[];
};

const asyncRoute =
  (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
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
          .json({ error: 'Unauthorized' });
        return;
      }
      next();
    });
  }

  const api = Router();

  api.get(
    '/employees/incoming',
    asyncRoute(async (_req, res) => {
      const employees = await config.onboardUtilities.fetchIncomingEmployees();
      res.json({ employees });
    }),
  );

  api.get(
    '/employees/active',
    asyncRoute(async (_req, res) => {
      const employees =
        await config.activeMaintenanceUtilities.fetchEmailSignatures();
      res.json({ employees });
    }),
  );

  api.get(
    '/employees/inactive',
    asyncRoute(async (_req, res) => {
      const employees = await config.offboardUtilities.fetchInactiveEmployees();
      res.json({ employees });
    }),
  );

  api.get(
    '/onboard',
    asyncRoute(async (_req, res) => {
      await EmployeeHandlerService.onboardIncomingEmployees(config);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.post(
    '/onboard/manualOnboard',
    asyncRoute(async (req, res) => {
      const { emails } = (req.body ?? {}) as { emails?: string[] };
      if (!Array.isArray(emails)) {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'emails array required' });
        return;
      }
      type ProcessIncomingArgs = Parameters<
        typeof config.onboardUtilities.processIncomingEmployees
      >[0];
      const users = emails.map(email => ({ email })) as ProcessIncomingArgs;
      await config.onboardUtilities.processIncomingEmployees(users);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.get(
    '/offboard',
    asyncRoute(async (_req, res) => {
      await EmployeeHandlerService.offboardInactiveEmployees(config);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.post(
    '/offboard/manualOffboard',
    asyncRoute(async (req, res) => {
      const { emails } = (req.body ?? {}) as { emails?: string[] };
      if (!Array.isArray(emails)) {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'emails array required' });
        return;
      }
      await EmployeeHandlerService.manualOffboardEmails(config, emails);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.post(
    '/recover',
    asyncRoute(async (req, res) => {
      const { emails } = (req.body ?? {}) as { emails?: string[] };
      if (!Array.isArray(emails)) {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'emails array required' });
        return;
      }
      await config.activeMaintenanceUtilities.recoverUsers(emails);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.get(
    '/sync',
    asyncRoute(async (_req, res) => {
      await EmployeeHandlerService.syncData(config);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.get(
    '/postRetentionCleanup',
    asyncRoute(async (_req, res) => {
      await EmployeeHandlerService.postRetentionCleanup(config);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.get(
    '/signature/list',
    asyncRoute(async (_req, res) => {
      const signatures =
        await config.activeMaintenanceUtilities.fetchEmailSignatures();
      res.json({ signatures });
    }),
  );

  api.post(
    '/signature/update',
    asyncRoute(async (req, res) => {
      const { email, template } = (req.body ?? {}) as {
        email?: string;
        template?: string;
      };
      if (!email || typeof template !== 'string') {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'email and template required' });
        return;
      }
      await config.activeMaintenanceUtilities.processEmailSignatures([
        { email, signatureString: template },
      ]);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.post(
    '/signature/updateAll',
    asyncRoute(async (req, res) => {
      const { template } = (req.body ?? {}) as { template?: string };
      if (typeof template !== 'string') {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'template required' });
        return;
      }
      const signatures =
        await config.activeMaintenanceUtilities.fetchEmailSignatures();
      await config.activeMaintenanceUtilities.processEmailSignatures(
        signatures.map(sig => ({ ...sig, signatureString: template })),
      );
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.get(
    '/signature/updateEmailSignatures',
    asyncRoute(async (_req, res) => {
      await EmployeeHandlerService.updateEmailSignatures(config);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.post(
    '/signature/emailZippedSignatures',
    asyncRoute(async (req, res) => {
      const { emails } = (req.body ?? {}) as { emails?: string[] };
      if (!Array.isArray(emails)) {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ error: 'emails array required' });
        return;
      }
      await EmployeeHandlerService.emailZippedSignatures(config, emails);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    }),
  );

  api.get(
    '/signature/downloadZippedSignatures',
    asyncRoute(async (_req, res) => {
      await EmployeeHandlerService.generateLocalSignatures(config);
      if (!fs.existsSync(ZIPPED_GENERATED_SIGNATURES_FILEPATH)) {
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to generate signatures zip' });
        return;
      }
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="signatures.zip"',
      );
      res.setHeader('Content-Type', 'application/zip');
      fs.createReadStream(ZIPPED_GENERATED_SIGNATURES_FILEPATH).pipe(res);
    }),
  );

  api.get('/signature-templates', (_req, res) => {
    res.json({ templates: store.list() });
  });

  api.post('/signature-templates', (req, res) => {
    const body = req.body as SignatureTemplate;
    if (
      !body?.id ||
      typeof body.label !== 'string' ||
      typeof body.template !== 'string'
    ) {
      res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ error: 'id, label, template required' });
      return;
    }
    const created = store.create(body);
    res.status(HTTP_STATUS_CODES.CREATED).json(created);
  });

  api.patch('/signature-templates/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<SignatureTemplate>;
    const updated = store.update(id, body);
    if (!updated) {
      res.status(HTTP_STATUS_CODES.INVALID_PATH).end();
      return;
    }
    res.json(updated);
  });

  api.delete('/signature-templates/:id', (req, res) => {
    const { id } = req.params;
    const deleted = store.delete(id);
    if (!deleted) {
      res.status(HTTP_STATUS_CODES.INVALID_PATH).end();
      return;
    }
    res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
  });

  app.use('/api', api);
  app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};
