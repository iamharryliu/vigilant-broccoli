import { Router, Request, Response } from 'express';
import {
  HTTP_STATUS_CODES,
  VB_EXPRESS_SERVICE,
} from '@vigilant-broccoli/common-js';
import { API_KEY_PERMISSION_RESOURCE, auth } from '../auth';

const ERROR_EMAIL_REQUIRED = 'email is required';
const ALL_SERVICES = Object.values(VB_EXPRESS_SERVICE);

const router = Router();

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

export default router;
