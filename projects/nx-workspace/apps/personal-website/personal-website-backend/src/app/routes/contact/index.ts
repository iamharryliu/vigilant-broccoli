import { FastifyInstance } from 'fastify';
import { MessageRequest } from '@prettydamntired/personal-website-lib';
import {
  getEnvironmentVariable,
  RecaptchaService,
} from '@vigilant-broccoli/common-node';

const EMAIL_SERVICE_URL = getEnvironmentVariable('EMAIL_SERVICE_URL');
const EMAIL_SERVICE_API_KEY = getEnvironmentVariable('EMAIL_SERVICE_API_KEY');

const PERSONAL_EMAIL = 'harryliu1995@gmail.com';
const SENDER_EMAIL = 'Harry Liu <contact@harryliu.dev>';

type ContactRequestBody = MessageRequest & { recaptchaToken?: string };

const recaptchaService = new RecaptchaService();

const verifyRecaptcha = async (token?: string) => {
  if (!token) return false;
  return recaptchaService.isTrustedRequest(token);
};

const sendEmail = async (
  from: string,
  to: string,
  subject: string,
  html: string,
) => {
  const response = await fetch(`${EMAIL_SERVICE_URL}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': EMAIL_SERVICE_API_KEY,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Email service request failed');
  }
};

const sendEmails = (name: string, email: string, message: string) =>
  Promise.all([
    sendEmail(
      SENDER_EMAIL,
      PERSONAL_EMAIL,
      `Contact form message from ${name}`,
      `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>`,
    ),
    sendEmail(
      SENDER_EMAIL,
      email,
      `Thanks for reaching out, ${name}!`,
      `<p>Hi ${name},</p>
<p>Thanks for your message! I've received it and will get back to you soon.</p>
<p>- Harry</p>`,
    ),
  ]);

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

    await sendEmails(name, email, message);

    return reply.send({ success: true });
  });
}
