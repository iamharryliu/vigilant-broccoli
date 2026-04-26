import amqplib from 'amqplib';
import {
  Email,
  getEnvironmentVariable,
  QUEUE,
} from '@vigilant-broccoli/common-node';

const EMAIL_SERVICE_URL = getEnvironmentVariable('EMAIL_SERVICE_URL');
const EMAIL_SERVICE_API_KEY = getEnvironmentVariable('EMAIL_SERVICE_API_KEY');
const RABBITMQ_CONNECTION_STRING = getEnvironmentVariable(
  'RABBITMQ_CONNECTION_STRING',
);
const RECONNECT_DELAY_MS = 5000;
const SEND_EMAIL_TIMEOUT_MS = 30000;

async function sendEmail(email: Email) {
  const response = await fetch(`${EMAIL_SERVICE_URL}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': EMAIL_SERVICE_API_KEY,
    },
    body: JSON.stringify(email),
    signal: AbortSignal.timeout(SEND_EMAIL_TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Email service request failed');
  }
}

async function start() {
  const connection = await amqplib.connect(RABBITMQ_CONNECTION_STRING);
  connection.on('error', err => {
    console.error('RabbitMQ connection error:', err.message);
  });
  connection.on('close', () => {
    console.warn('RabbitMQ connection closed, reconnecting...');
    setTimeout(start, RECONNECT_DELAY_MS);
  });

  const channel = await connection.createChannel();
  await channel.prefetch(1);
  await channel.assertQueue(QUEUE.EMAIL, { durable: true });
  console.log(`Waiting for messages in ${QUEUE.EMAIL}...`);

  channel.consume(
    QUEUE.EMAIL,
    async msg => {
      if (msg) {
        console.log('Received message.');
        try {
          await sendEmail(JSON.parse(msg.content.toString()));
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

start().catch(err => {
  console.error('Failed to start consumer:', err.message);
  setTimeout(start, RECONNECT_DELAY_MS);
});
