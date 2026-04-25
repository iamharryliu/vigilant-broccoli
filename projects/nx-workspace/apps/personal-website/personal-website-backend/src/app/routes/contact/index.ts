import { FastifyInstance } from 'fastify';
import { MessageRequest } from '@prettydamntired/personal-website-lib';
import {
  Email,
  getEnvironmentVariable,
  QUEUE,
  RecaptchaService,
} from '@vigilant-broccoli/common-node';
import amqplib from 'amqplib';

const RABBITMQ_CONNECTION_STRING = getEnvironmentVariable(
  'RABBITMQ_CONNECTION_STRING',
);

const PERSONAL_EMAIL = 'harryliu1995@gmail.com';
const SENDER_EMAIL = 'Harry Liu <contact@harryliu.dev>';

type ContactRequestBody = MessageRequest & { recaptchaToken?: string };

const recaptchaService = new RecaptchaService();

const verifyRecaptcha = async (token?: string) => {
  if (!token) return false;
  return recaptchaService.isTrustedRequest(token);
};

const publishToQueue = async (emails: Email[]) => {
  const connection = await amqplib.connect(RABBITMQ_CONNECTION_STRING);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE.EMAIL, { durable: true });
  for (const email of emails) {
    channel.sendToQueue(QUEUE.EMAIL, Buffer.from(JSON.stringify(email)), {
      persistent: true,
    });
  }
  setTimeout(() => connection.close(), 500);
};

const buildEmails = (name: string, email: string, message: string): Email[] => [
  {
    from: SENDER_EMAIL,
    to: PERSONAL_EMAIL,
    subject: `Contact form message from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>`,
  },
  {
    from: SENDER_EMAIL,
    to: email,
    subject: `Thanks for reaching out, ${name}!`,
    html: `<p>Hi ${name},</p>
<p>Thanks for your message! I've received it and will get back to you soon.</p>
<p>- Harry</p>`,
  },
];

export default async function (fastify: FastifyInstance) {
  fastify.post('/send-message', async (request, reply) => {
    const { name, email, message, recaptchaToken } =
      request.body as ContactRequestBody;

    if (!(await verifyRecaptcha(recaptchaToken))) {
      return reply.status(403).send({ error: 'reCAPTCHA verification failed' });
    }

    if (!name || !email || !message) {
      return reply
        .status(400)
        .send({ error: 'name, email, and message are required' });
    }

    await publishToQueue(buildEmails(name, email, message));

    return reply.send({ success: true });
  });
}
