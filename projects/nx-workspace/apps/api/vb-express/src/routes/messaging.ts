import { Router, Request, Response } from 'express';
import {
  EMAIL_SERVICE_ENDPOINT,
  getEnvironmentVariable,
  TextMessageService,
  Email,
} from '@vigilant-broccoli/common-node';
import {
  APP_NAME,
  MessageRequest,
} from '@vigilant-broccoli/personal-common-js';
import {
  requireJsonContent,
  checkRecaptchaToken,
} from '@vigilant-broccoli/express';

const router = Router();
const textMessageService = new TextMessageService();
const EMAIL_SERVICE_URL = getEnvironmentVariable('EMAIL_SERVICE_URL');
const EMAIL_SERVICE_API_KEY = getEnvironmentVariable('EMAIL_SERVICE_API_KEY');

const APP_EMAIL_CONFIG: Record<string, { from: string; to: string }> = {
  [APP_NAME.HARRYLIU_DESIGN]: {
    from: 'Harry Liu <contact@harryliu.dev>',
    to: 'harryliu1995@gmail.com',
  },
  [APP_NAME.CLOUD_8_SKATE]: {
    from: 'Cloud8Skate <contact@harryliu.dev>',
    to: 'cloud8.ca@gmail.com',
  },
};

const buildEmails = (
  name: string,
  email: string,
  message: string,
  appName: string,
): Email[] => {
  const config =
    APP_EMAIL_CONFIG[appName] ?? APP_EMAIL_CONFIG[APP_NAME.HARRYLIU_DESIGN];
  return [
    {
      from: config.from,
      to: config.to,
      subject: `Contact form message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    },
    {
      from: config.from,
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `<p>Hi ${name},</p><p>Thanks for your message! I've received it and will get back to you soon.</p><p>- Harry</p>`,
    },
  ];
};

router.post('/send-text-message', async (req: Request, res: Response) => {
  const { body, from, to } = req.body;

  if (!body || !from || !to) {
    return res.status(400).json({ error: 'body, from, and to are required' });
  }

  const result = await textMessageService.sendTextMessage({
    body,
    from,
    to,
  });

  return res.json({
    success: true,
    sid: result.sid,
  });
});

router.post(
  '/contact/send-message',
  requireJsonContent,
  checkRecaptchaToken,
  async (req: Request, res: Response) => {
    const { name, email, message, appName } = req.body as MessageRequest;
    const emails = buildEmails(name, email, message, appName);
    try {
      const response = await fetch(
        `${EMAIL_SERVICE_URL}/${EMAIL_SERVICE_ENDPOINT.QUEUE_EMAILS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': EMAIL_SERVICE_API_KEY,
          },
          body: JSON.stringify(emails),
        },
      );
      if (!response.ok) {
        throw new Error(`Email service responded with ${response.status}`);
      }
      console.log(`📤 Queued ${emails.length} emails from: ${email}`);
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to queue emails:', (err as Error).message);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },
);

export default router;
