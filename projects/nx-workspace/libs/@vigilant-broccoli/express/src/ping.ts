import { Router } from 'express';

export const PING_PATH = '/__ping';

export const pingRouter = Router();

pingRouter.get(PING_PATH, (_req, res) => {
  res.json({ ok: true });
});
