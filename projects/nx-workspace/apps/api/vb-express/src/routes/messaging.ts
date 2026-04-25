import { Router, Request, Response } from 'express';
import {
  QUEUE,
  getEnvironmentVariable,
  TextMessageService,
  Email,
} from '@vigilant-broccoli/common-node';
import {
  APP_NAME,
  MessageRequest,
} from '@prettydamntired/personal-website-lib';
import amqplib from 'amqplib';
import {
  requireJsonContent,
  checkRecaptchaToken,
} from '@vigilant-broccoli/express';

const router = Router();
const textMessageService = new TextMessageService();
const RABBITMQ_CONNECTION_STRING = getEnvironmentVariable(
  'RABBITMQ_CONNECTION_STRING',
);
const RABBITMQ_CA_CERT = process.env.RABBITMQ_CA_CERT;
const RABBITMQ_SOCKET_OPTIONS = RABBITMQ_CA_CERT
  ? {
      ca: [Buffer.from(RABBITMQ_CA_CERT, 'base64')],
      checkServerIdentity: () => undefined,
    }
  : undefined;

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
    const connection = await amqplib.connect(
      RABBITMQ_CONNECTION_STRING,
      RABBITMQ_SOCKET_OPTIONS,
    );
    try {
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE.EMAIL, { durable: true });
      for (const emailPayload of emails) {
        channel.sendToQueue(
          QUEUE.EMAIL,
          Buffer.from(JSON.stringify(emailPayload)),
          { persistent: true },
        );
      }
      console.log(`📤 Queued ${emails.length} emails from: ${email}`);
      res.json({ success: true });
    } finally {
      connection.close();
    }
  },
);

export default router;
