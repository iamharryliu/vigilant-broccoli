import express, { Request, Response, NextFunction } from 'express';
import amqplib, { ConfirmChannel } from 'amqplib';
import swaggerUi from 'swagger-ui-express';
import {
  EMAIL_SERVICE_ENDPOINT,
  QUEUE,
  requestLoggerMiddleware,
} from '@vigilant-broccoli/common-node';
import { Email, EmailService } from '@vigilant-broccoli/messaging';
import { DOCS_PATH, swaggerUiCdnOptions } from '@vigilant-broccoli/express';
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
const app = express();

app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(
  DOCS_PATH,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiCdnOptions),
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

const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-api-key'];
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME, docs: DOCS_PATH });
});

const queueEmails = async (emails: Email[]): Promise<void> => {
  const ch = await getPublishChannel();
  for (const email of emails) {
    ch.sendToQueue(QUEUE.EMAIL, Buffer.from(JSON.stringify(email)), {
      persistent: true,
    });
  }
  console.log(`📤 Queued ${emails.length} emails`);
};

app.post(
  `/${EMAIL_SERVICE_ENDPOINT.SEND_EMAIL}`,
  validateApiKey,
  async (req: Request, res: Response) => {
    const email: Email = req.body;
    if (!email.to || !email.subject) {
      res.status(400).json({ error: 'to and subject are required' });
      return;
    }
    try {
      await queueEmails([email]);
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to queue email:', (err as Error).message);
      publishChannel = null;
      res.status(500).json({ error: 'Failed to queue email' });
    }
  },
);

app.post(
  `/${EMAIL_SERVICE_ENDPOINT.QUEUE_EMAILS}`,
  validateApiKey,
  async (req: Request, res: Response) => {
    const emails: Email[] = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({ error: 'emails array is required' });
      return;
    }
    try {
      await queueEmails(emails);
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to queue emails:', (err as Error).message);
      publishChannel = null;
      res.status(500).json({ error: 'Failed to queue emails' });
    }
  },
);

app.listen(PORT, HOST, () => {
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});

if (RABBITMQ_CONNECTION_STRING) {
  startConsumer().catch(err => {
    console.error('Failed to start consumer:', err.message);
    setTimeout(startConsumer, RECONNECT_DELAY_MS);
  });
}
