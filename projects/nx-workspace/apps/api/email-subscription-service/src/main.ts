import Fastify from 'fastify';
import amqplib, { ConfirmChannel } from 'amqplib';
import { createClient } from '@supabase/supabase-js';
import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  EMAIL_SERVICE_ENDPOINT,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  JSON_CONTENT_TYPE,
  QUEUE,
} from '@vigilant-broccoli/common-js';
import { Email } from '@vigilant-broccoli/messaging';
import {
  createApiKeyPlugin,
  createDocsPlugin,
  DOCS_PATH,
  pingPlugin,
  requestLoggerPlugin,
} from '@vigilant-broccoli/fastify';
import { swaggerSpec } from './swagger';

const SERVICE_NAME = 'email-subscription-service';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const API_KEY = process.env.SHARED_APP_TOKEN;
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING;
const RABBITMQ_CA_CERT = process.env.RABBITMQ_CA_CERT;
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;
const SHARED_APP_TOKEN = process.env.SHARED_APP_TOKEN;
const EMAIL_FROM = 'Vigilant Broccoli <contact@harryliu.dev>';
const RECONNECT_DELAY_MS = 5000;
const SEND_EMAIL_TIMEOUT_MS = 30000;
const TABLE = 'email_subscriptions';
const API_PREFIX = '/api';

const ERROR_EMAIL_AND_NAME_REQUIRED = 'email and subscriptionName are required';
const ERROR_NAME_AND_MESSAGE_REQUIRED =
  'subscriptionName and message are required';
const ERROR_FAILED_SAVE_SUBSCRIPTION = 'Failed to save subscription';
const ERROR_FAILED_REMOVE_SUBSCRIPTION = 'Failed to remove subscription';
const ERROR_FAILED_FETCH_SUBSCRIBERS = 'Failed to fetch subscribers';
const ERROR_EMAIL_SERVICE_REQUEST_FAILED = 'Email service request failed';

const RABBITMQ_SOCKET_OPTIONS = RABBITMQ_CA_CERT
  ? {
      ca: [Buffer.from(RABBITMQ_CA_CERT, 'base64')],
      checkServerIdentity: () => undefined,
    }
  : undefined;

const supabase = createClient(
  'https://jrdosjjgmsoodpjmjqxx.supabase.co',
  process.env.SUPABASE_SECRET_KEY as string,
);

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
  await publishChannel.assertQueue(QUEUE.EMAIL_SUBSCRIPTION, { durable: true });
  return publishChannel;
};

const queueEmail = async (email: Email): Promise<void> => {
  const ch = await getPublishChannel();
  ch.sendToQueue(QUEUE.EMAIL_SUBSCRIPTION, Buffer.from(JSON.stringify(email)), {
    persistent: true,
  });
};

async function sendEmail(email: Email): Promise<void> {
  const response = await fetch(
    `${EMAIL_SERVICE_URL}/${EMAIL_SERVICE_ENDPOINT.SEND_EMAIL}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
        [API_KEY_HEADER]: SHARED_APP_TOKEN!,
      },
      body: JSON.stringify(email),
      signal: AbortSignal.timeout(SEND_EMAIL_TIMEOUT_MS),
    },
  );
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || ERROR_EMAIL_SERVICE_REQUEST_FAILED);
  }
}

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
  await channel.assertQueue(QUEUE.EMAIL_SUBSCRIPTION, { durable: true });
  console.log(`Waiting for messages in ${QUEUE.EMAIL_SUBSCRIPTION}...`);

  channel.consume(
    QUEUE.EMAIL_SUBSCRIPTION,
    async msg => {
      if (msg) {
        try {
          const email: Email = JSON.parse(msg.content.toString());
          await sendEmail(email);
          channel.ack(msg);
          console.log('Subscription email sent and acknowledged.');
        } catch (err) {
          console.error(
            'Failed to send subscription email, requeuing:',
            (err as Error).message,
          );
          channel.nack(msg, false, true);
        }
      }
    },
    { noAck: false },
  );
}

type SubscriptionBody = { email?: string; subscriptionName?: string };
type NotifyBody = { subscriptionName?: string; message?: string };

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

      api.post('/subscribe', async (req, reply) => {
        const { email, subscriptionName } = (req.body ||
          {}) as SubscriptionBody;
        if (!email || !subscriptionName) {
          return reply
            .code(HTTP_STATUS_CODES.BAD_REQUEST)
            .send({ error: ERROR_EMAIL_AND_NAME_REQUIRED });
        }

        const { error } = await supabase
          .from(TABLE)
          .upsert(
            { email, subscription_name: subscriptionName },
            { onConflict: 'email,subscription_name' },
          );

        if (error) {
          console.error('Failed to save subscription:', error.message);
          return reply
            .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .send({ error: ERROR_FAILED_SAVE_SUBSCRIPTION });
        }

        try {
          await queueEmail({
            from: EMAIL_FROM,
            to: email,
            subject: `You're subscribed to ${subscriptionName}`,
            html: `<p>Hi,</p><p>You've successfully subscribed to <strong>${subscriptionName}</strong>. You'll receive updates here.</p>`,
          });
        } catch (err) {
          console.error(
            'Failed to queue confirmation email:',
            (err as Error).message,
          );
        }

        return reply.send({ success: true });
      });

      api.post('/unsubscribe', async (req, reply) => {
        const { email, subscriptionName } = (req.body ||
          {}) as SubscriptionBody;
        if (!email || !subscriptionName) {
          return reply
            .code(HTTP_STATUS_CODES.BAD_REQUEST)
            .send({ error: ERROR_EMAIL_AND_NAME_REQUIRED });
        }

        const { error } = await supabase
          .from(TABLE)
          .delete()
          .eq('email', email)
          .eq('subscription_name', subscriptionName);

        if (error) {
          console.error('Failed to remove subscription:', error.message);
          return reply
            .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .send({ error: ERROR_FAILED_REMOVE_SUBSCRIPTION });
        }

        return reply.send({ success: true });
      });

      api.post('/notify', async (req, reply) => {
        const { subscriptionName, message } = (req.body || {}) as NotifyBody;
        if (!subscriptionName || !message) {
          return reply
            .code(HTTP_STATUS_CODES.BAD_REQUEST)
            .send({ error: ERROR_NAME_AND_MESSAGE_REQUIRED });
        }

        const { data: subscribers, error } = await supabase
          .from(TABLE)
          .select('email')
          .eq('subscription_name', subscriptionName);

        if (error) {
          console.error('Failed to fetch subscribers:', error.message);
          return reply
            .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .send({ error: ERROR_FAILED_FETCH_SUBSCRIBERS });
        }

        if (!subscribers?.length) {
          return reply.send({ success: true, queued: 0 });
        }

        let queued = 0;
        for (const { email } of subscribers) {
          try {
            await queueEmail({
              from: EMAIL_FROM,
              to: email,
              subject: `New update from ${subscriptionName}`,
              html: `<p>${message}</p>`,
            });
            queued++;
          } catch (err) {
            console.error(
              `Failed to queue email for ${email}:`,
              (err as Error).message,
            );
          }
        }

        console.log(
          `📤 Queued ${queued}/${subscribers.length} emails for ${subscriptionName}`,
        );
        return reply.send({ success: true, queued });
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
