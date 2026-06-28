import { Router, Request, Response } from 'express';
import { EMAIL_SERVICE_ENDPOINT } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { Email, TextMessageService } from '@vigilant-broccoli/messaging';
import {
  APP_NAME,
  MessageRequest,
} from '@vigilant-broccoli/personal-common-js';
import {
  requireJsonContent,
  checkRecaptchaToken,
} from '@vigilant-broccoli/express';

const textMessageService = new TextMessageService();
const EMAIL_SERVICE_URL = getEnvironmentVariable('EMAIL_SERVICE_URL');
const SHARED_APP_TOKEN = getEnvironmentVariable('SHARED_APP_TOKEN');

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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildEmails = (
  name: string,
  email: string,
  message: string,
  appName: string,
): Email[] => {
  const config =
    APP_EMAIL_CONFIG[appName] ?? APP_EMAIL_CONFIG[APP_NAME.HARRYLIU_DESIGN];
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  return [
    {
      from: config.from,
      to: config.to,
      subject: `Contact form message from ${safeName}`,
      html: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong></p><p>${safeMessage}</p>`,
    },
  ];
};

export const messagingRouter = Router();

messagingRouter.post(
  '/send-text-message',
  async (req: Request, res: Response) => {
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
  },
);

export const contactRouter = Router();

contactRouter.post(
  '/send-message',
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
            'x-api-key': SHARED_APP_TOKEN,
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
