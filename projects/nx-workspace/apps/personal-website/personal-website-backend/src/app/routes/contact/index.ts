import { FastifyInstance } from 'fastify';
import { Resend } from 'resend';
import { MessageRequest } from '@prettydamntired/personal-website-lib';
import {
  getEnvironmentVariable,
  RecaptchaService,
} from '@vigilant-broccoli/common-node';

const ENV_KEYS = {
  RESEND_API_KEY: 'RESEND_API_KEY',
} as const;

const PERSONAL_EMAIL = 'harryliu1995@gmail.com';
const SENDER_EMAIL = 'Harry Liu <contact@harryliu.dev>';

type ContactRequestBody = MessageRequest & { recaptchaToken?: string };

const recaptchaService = new RecaptchaService();
const resend = new Resend(getEnvironmentVariable(ENV_KEYS.RESEND_API_KEY));

const verifyRecaptcha = async (token?: string) => {
  if (!token) return false;
  return recaptchaService.isTrustedRequest(token);
};

const sendEmails = (name: string, email: string, message: string) =>
  Promise.all([
    resend.emails.send({
      from: SENDER_EMAIL,
      to: PERSONAL_EMAIL,
      subject: `Contact form message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>`,
    }),
    resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `<p>Hi ${name},</p>
<p>Thanks for your message! I've received it and will get back to you soon.</p>
<p>- Harry</p>`,
    }),
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

    const [notification, confirmation] = await sendEmails(name, email, message);

    if (notification.error || confirmation.error) {
      return reply.status(500).send({
        error: notification.error?.message || confirmation.error?.message,
      });
    }

    return reply.send({ success: true });
  });
}
