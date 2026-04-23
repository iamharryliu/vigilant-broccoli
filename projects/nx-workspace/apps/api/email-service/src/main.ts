import express, { Request, Response, NextFunction } from 'express';
import { EmailService } from '@vigilant-broccoli/common-node';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const API_KEY = process.env.EMAIL_SERVICE_API_KEY;

const emailService = new EmailService({ provider: 'resend' });
const app = express();

app.use(express.json());

const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-api-key'];
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/send-email', validateApiKey, async (req: Request, res: Response) => {
  const { from, to, subject, html } = req.body;

  if (!from || !to || !subject || !html) {
    res.status(400).json({ error: 'from, to, subject, and html are required' });
    return;
  }

  try {
    await emailService.sendEmail({ from, to, subject, html });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});
