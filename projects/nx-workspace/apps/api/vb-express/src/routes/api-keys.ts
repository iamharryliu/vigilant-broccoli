import { Router, Request, Response } from 'express';
import {
  HTTP_STATUS_CODES,
  VB_EXPRESS_SERVICE,
} from '@vigilant-broccoli/common-js';
import { API_KEY_MODEL, API_KEY_PERMISSION_RESOURCE, auth } from '../auth';

const ERROR_EMAIL_REQUIRED = 'email is required';
const ERROR_NO_UPDATE_FIELDS = 'no valid update fields';
const ERROR_KEY_NOT_FOUND = 'api key not found';
const ALL_SERVICES = Object.values(VB_EXPRESS_SERVICE);
const USER_MODEL = 'user';

type ApiKeyRow = {
  id: string;
  name: string | null;
  start: string | null;
  enabled: boolean;
  permissions: string | null;
  createdAt: Date;
  lastRequest: Date | null;
  referenceId: string;
};

type UserRow = { id: string; email: string };

const parseServices = (permissions: string | null): string[] =>
  permissions
    ? (JSON.parse(permissions)[API_KEY_PERMISSION_RESOURCE] ?? [])
    : [];

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const context = await auth.$context;
  const keys = (await context.adapter.findMany({
    model: API_KEY_MODEL,
  })) as ApiKeyRow[];
  const users = (await context.adapter.findMany({
    model: USER_MODEL,
  })) as UserRow[];
  const emailById = new Map(users.map(user => [user.id, user.email]));
  const result = keys
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map(key => ({
      id: key.id,
      name: key.name,
      start: key.start,
      services: parseServices(key.permissions),
      enabled: key.enabled,
      createdAt: key.createdAt,
      lastRequest: key.lastRequest,
      email: emailById.get(key.referenceId) ?? null,
    }));
  return res.json({ keys: result });
});

router.post('/', async (req: Request, res: Response) => {
  const { email, name, services } = req.body;
  if (!email) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: ERROR_EMAIL_REQUIRED });
  }
  const context = await auth.$context;
  const existingUser = await context.internalAdapter.findUserByEmail(email);
  const user =
    existingUser?.user ??
    (await context.internalAdapter.createUser({
      email,
      name: email,
      emailVerified: true,
    }));
  const grantedServices = services ?? ALL_SERVICES;
  const createdKey = await auth.api.createApiKey({
    body: {
      name,
      userId: user.id,
      permissions: { [API_KEY_PERMISSION_RESOURCE]: grantedServices },
    },
  });
  return res.status(HTTP_STATUS_CODES.CREATED).json({
    id: createdKey.id,
    key: createdKey.key,
    userId: user.id,
    services: grantedServices,
  });
});

router.patch('/:id', async (req: Request, res: Response) => {
  const { enabled, name, services } = req.body;
  const update = {
    ...(typeof enabled === 'boolean' ? { enabled } : {}),
    ...(typeof name === 'string' && name ? { name } : {}),
    ...(Array.isArray(services)
      ? {
          permissions: JSON.stringify({
            [API_KEY_PERMISSION_RESOURCE]: services,
          }),
        }
      : {}),
  };
  if (!Object.keys(update).length) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: ERROR_NO_UPDATE_FIELDS });
  }
  const context = await auth.$context;
  const updated = await context.adapter.update({
    model: API_KEY_MODEL,
    where: [{ field: 'id', value: req.params.id }],
    update,
  });
  if (!updated) {
    return res
      .status(HTTP_STATUS_CODES.INVALID_PATH)
      .json({ error: ERROR_KEY_NOT_FOUND });
  }
  return res.json({ id: req.params.id });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const context = await auth.$context;
  const existing = await context.adapter.findOne({
    model: API_KEY_MODEL,
    where: [{ field: 'id', value: req.params.id }],
  });
  if (!existing) {
    return res
      .status(HTTP_STATUS_CODES.INVALID_PATH)
      .json({ error: ERROR_KEY_NOT_FOUND });
  }
  await context.adapter.delete({
    model: API_KEY_MODEL,
    where: [{ field: 'id', value: req.params.id }],
  });
  return res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
});

export default router;
