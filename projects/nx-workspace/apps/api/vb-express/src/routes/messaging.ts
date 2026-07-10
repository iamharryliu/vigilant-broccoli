import { FastifyPluginAsync } from 'fastify';
import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  EMAIL_SERVICE_ENDPOINT,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { Email, TextMessageService } from '@vigilant-broccoli/messaging';
import {
  APP_NAME,
  MessageRequest,
} from '@vigilant-broccoli/personal-common-js';

let textMessageService: TextMessageService | undefined;
const getTextMessageService = () => {
  textMessageService = textMessageService ?? new TextMessageService();
  return textMessageService;
};
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

const ERROR_TEXT_MESSAGE_FIELDS_REQUIRED = 'body, from, and to are required';
const ERROR_SEND_MESSAGE_FAILED = 'Failed to send message';

type SendTextMessageBody = { body?: string; from?: string; to?: string };

export const messagingRoutes: FastifyPluginAsync = async app => {
  app.post('/send-text-message', async (req, reply) => {
    const { body, from, to } = req.body as SendTextMessageBody;

    if (!body || !from || !to) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_TEXT_MESSAGE_FIELDS_REQUIRED });
    }

    const result = await getTextMessageService().sendTextMessage({
      body,
      from,
      to,
    });

    return {
      success: true,
      sid: result.sid,
    };
  });
};

export const contactRoutes: FastifyPluginAsync = async app => {
  app.post('/send-message', async (req, reply) => {
    const { name, email, message, appName } = req.body as MessageRequest;
    const emails = buildEmails(name, email, message, appName);
    try {
      const response = await fetch(
        `${EMAIL_SERVICE_URL}/${EMAIL_SERVICE_ENDPOINT.QUEUE_EMAILS}`,
        {
          method: HTTP_METHOD.POST,
          headers: {
            [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
            [API_KEY_HEADER]: SHARED_APP_TOKEN ?? '',
          },
          body: JSON.stringify(emails),
        },
      );
      if (!response.ok) {
        throw new Error(`Email service responded with ${response.status}`);
      }
      console.log(`📤 Queued ${emails.length} emails from: ${email}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to queue emails:', (err as Error).message);
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: ERROR_SEND_MESSAGE_FAILED });
    }
  });
};
