import amqplib from 'amqplib';
import {
  Email,
  getEnvironmentVariable,
  QUEUE,
} from '@vigilant-broccoli/common-node';

const EMAIL_SERVICE_URL = getEnvironmentVariable('EMAIL_SERVICE_URL');
const EMAIL_SERVICE_API_KEY = getEnvironmentVariable('EMAIL_SERVICE_API_KEY');

async function sendEmail(email: Email) {
  const response = await fetch(`${EMAIL_SERVICE_URL}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': EMAIL_SERVICE_API_KEY,
    },
    body: JSON.stringify(email),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Email service request failed');
  }
}

async function receiveMessage() {
  const RABBITMQ_CONNECTION_STRING = getEnvironmentVariable(
    'RABBITMQ_CONNECTION_STRING',
  );
  const connection = await amqplib.connect(RABBITMQ_CONNECTION_STRING);
  const channel = await connection.createChannel();
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

receiveMessage();
