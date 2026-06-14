import Fastify from 'fastify';
import amqplib, { ConfirmChannel } from 'amqplib';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { EMAIL_SERVICE_ENDPOINT, QUEUE } from '@vigilant-broccoli/common-node';
import { Email, EmailService } from '@vigilant-broccoli/messaging';
import {
  createApiKeyPlugin,
  createDocsPlugin,
  DOCS_PATH,
  pingPlugin,
  requestLoggerPlugin,
} from '@vigilant-broccoli/fastify';
import { swaggerSpec } from './swagger';

const SERVICE_NAME = 'email-service';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const API_KEY = process.env.SHARED_APP_TOKEN;
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING;
const RABBITMQ_CA_CERT = process.env.RABBITMQ_CA_CERT;
const RECONNECT_DELAY_MS = 5000;

const RABBITMQ_SOCKET_OPTIONS = RABBITMQ_CA_CERT
  ? {
      ca: [Buffer.from(RABBITMQ_CA_CERT, 'base64')],
      checkServerIdentity: () => undefined,
    }
  : undefined;

const emailService = new EmailService({ provider: 'resend' });

let publishChannel: ConfirmChannel | null = null;

const getPublishChannel = async (): Promise<ConfirmChannel> => {
  if (publishChannel) return publishChannel;
  const connection = await amqplib.connect(
    RABBITMQ_CONNECTION_STRING!,
    RABBITMQ_SOCKET_OPTIONS,
  );
  connection.on('error', err => {
    console.error('RabbitMQ producer connection error:', err.message);
    publishChannel = null;
  });
  connection.on('close', () => {
    console.warn(
      'RabbitMQ producer connection closed, will reconnect on next request',
    );
    publishChannel = null;
  });
  publishChannel = await connection.createConfirmChannel();
  await publishChannel.assertQueue(QUEUE.EMAIL, { durable: true });
  return publishChannel;
};

async function startConsumer() {
  const connection = await amqplib.connect(
    RABBITMQ_CONNECTION_STRING!,
    RABBITMQ_SOCKET_OPTIONS,
  );
  connection.on('error', err => {
    console.error('RabbitMQ consumer connection error:', err.message);
  });
  connection.on('close', () => {
    console.warn('RabbitMQ consumer connection closed, reconnecting...');
    setTimeout(startConsumer, RECONNECT_DELAY_MS);
  });

  const channel = await connection.createChannel();
  await channel.prefetch(1);
  await channel.assertQueue(QUEUE.EMAIL, { durable: true });
  console.log(`Waiting for messages in ${QUEUE.EMAIL}...`);

  channel.consume(
    QUEUE.EMAIL,
    async msg => {
      if (msg) {
        try {
          const email: Email = JSON.parse(msg.content.toString());
          await emailService.sendEmail(email);
          channel.ack(msg);
          console.log('Email sent and message acknowledged.');
        } catch (err) {
          console.error(
            'Failed to send email, requeuing:',
            (err as Error).message,
          );
          channel.nack(msg, false, true);
        }
      }
    },
    { noAck: false },
  );
}

const queueEmails = async (emails: Email[]): Promise<void> => {
  const ch = await getPublishChannel();
  for (const email of emails) {
    ch.sendToQueue(QUEUE.EMAIL, Buffer.from(JSON.stringify(email)), {
      persistent: true,
    });
  }
  console.log(`📤 Queued ${emails.length} emails`);
};

const API_PREFIX = '/api';
const SEND_EMAIL_PATH = `/${EMAIL_SERVICE_ENDPOINT.SEND_EMAIL.replace(/^api\//, '')}`;
const QUEUE_EMAILS_PATH = `/${EMAIL_SERVICE_ENDPOINT.QUEUE_EMAILS.replace(/^api\//, '')}`;

const ERROR_TO_AND_SUBJECT_REQUIRED = 'to and subject are required';
const ERROR_EMAILS_ARRAY_REQUIRED = 'emails array is required';
const ERROR_FAILED_TO_QUEUE_EMAIL = 'Failed to queue email';
const ERROR_FAILED_TO_QUEUE_EMAILS = 'Failed to queue emails';

const buildApp = async () => {
  const app = Fastify({ logger: false });

  await app.register(requestLoggerPlugin);
  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));

  app.get('/', async () => ({
    status: 'ok',
    service: SERVICE_NAME,
    docs: DOCS_PATH,
  }));

  await app.register(
    async api => {
      await api.register(createApiKeyPlugin(API_KEY));
      await api.register(pingPlugin);

      api.post(SEND_EMAIL_PATH, async (req, reply) => {
        const email = req.body as Email;
        if (!email.to || !email.subject) {
          return reply
            .code(HTTP_STATUS_CODES.BAD_REQUEST)
            .send({ error: ERROR_TO_AND_SUBJECT_REQUIRED });
        }
        try {
          await queueEmails([email]);
          return reply.send({ success: true });
        } catch (err) {
          console.error('Failed to queue email:', (err as Error).message);
          publishChannel = null;
          return reply
            .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .send({ error: ERROR_FAILED_TO_QUEUE_EMAIL });
        }
      });

      api.post(QUEUE_EMAILS_PATH, async (req, reply) => {
        const emails = req.body as Email[];
        if (!Array.isArray(emails) || emails.length === 0) {
          return reply
            .code(HTTP_STATUS_CODES.BAD_REQUEST)
            .send({ error: ERROR_EMAILS_ARRAY_REQUIRED });
        }
        try {
          await queueEmails(emails);
          return reply.send({ success: true });
        } catch (err) {
          console.error('Failed to queue emails:', (err as Error).message);
          publishChannel = null;
          return reply
            .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .send({ error: ERROR_FAILED_TO_QUEUE_EMAILS });
        }
      });
    },
    { prefix: API_PREFIX },
  );

  return app;
};

const start = async () => {
  const app = await buildApp();
  await app.listen({ port: PORT, host: HOST });
  console.log(`[ ready ] http://${HOST}:${PORT}`);

  if (RABBITMQ_CONNECTION_STRING) {
    startConsumer().catch(err => {
      console.error('Failed to start consumer:', err.message);
      setTimeout(startConsumer, RECONNECT_DELAY_MS);
    });
  }
};

start();
