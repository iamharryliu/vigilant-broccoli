import express, { Request, Response, NextFunction } from 'express';
import amqplib, { ConfirmChannel } from 'amqplib';
import { createClient } from '@supabase/supabase-js';
import {
  Email,
  EMAIL_SERVICE_ENDPOINT,
  QUEUE,
  requestLoggerMiddleware,
} from '@vigilant-broccoli/common-node';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const API_KEY = process.env.EMAIL_SUBSCRIPTION_SERVICE_API_KEY;
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING;
const RABBITMQ_CA_CERT = process.env.RABBITMQ_CA_CERT;
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;
const EMAIL_SERVICE_API_KEY = process.env.EMAIL_SERVICE_API_KEY;
const EMAIL_FROM = 'Vigilant Broccoli <contact@harryliu.dev>';
const RECONNECT_DELAY_MS = 5000;
const SEND_EMAIL_TIMEOUT_MS = 30000;
const TABLE = 'email_subscriptions';

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

const app = express();
app.use(express.json());
app.use(requestLoggerMiddleware);

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EMAIL_SERVICE_API_KEY!,
      },
      body: JSON.stringify(email),
      signal: AbortSignal.timeout(SEND_EMAIL_TIMEOUT_MS),
    },
  );
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Email service request failed');
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

app.post('/subscribe', validateApiKey, async (req: Request, res: Response) => {
  const { email, subscriptionName } = req.body;
  if (!email || !subscriptionName) {
    res.status(400).json({ error: 'email and subscriptionName are required' });
    return;
  }

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { email, subscription_name: subscriptionName },
      { onConflict: 'email,subscription_name' },
    );

  if (error) {
    console.error('Failed to save subscription:', error.message);
    res.status(500).json({ error: 'Failed to save subscription' });
    return;
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

  res.json({ success: true });
});

app.post(
  '/unsubscribe',
  validateApiKey,
  async (req: Request, res: Response) => {
    const { email, subscriptionName } = req.body;
    if (!email || !subscriptionName) {
      res
        .status(400)
        .json({ error: 'email and subscriptionName are required' });
      return;
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('email', email)
      .eq('subscription_name', subscriptionName);

    if (error) {
      console.error('Failed to remove subscription:', error.message);
      res.status(500).json({ error: 'Failed to remove subscription' });
      return;
    }

    res.json({ success: true });
  },
);

app.post('/notify', validateApiKey, async (req: Request, res: Response) => {
  const { subscriptionName, message } = req.body;
  if (!subscriptionName || !message) {
    res
      .status(400)
      .json({ error: 'subscriptionName and message are required' });
    return;
  }

  const { data: subscribers, error } = await supabase
    .from(TABLE)
    .select('email')
    .eq('subscription_name', subscriptionName);

  if (error) {
    console.error('Failed to fetch subscribers:', error.message);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
    return;
  }

  if (!subscribers?.length) {
    res.json({ success: true, queued: 0 });
    return;
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
  res.json({ success: true, queued });
});

app.listen(PORT, HOST, () => {
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});

if (RABBITMQ_CONNECTION_STRING) {
  startConsumer().catch(err => {
    console.error('Failed to start consumer:', err.message);
    setTimeout(startConsumer, RECONNECT_DELAY_MS);
  });
}
