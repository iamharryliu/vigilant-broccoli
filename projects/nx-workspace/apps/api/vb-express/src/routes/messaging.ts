import { Router, Request, Response } from 'express';
import {
  EmailService,
  QUEUE,
  getEnvironmentVariable,
} from '@vigilant-broccoli/common-node';
import { TextMessageService } from '@vigilant-broccoli/common-node';
import { MessageRequest } from '@prettydamntired/personal-website-lib';
import amqplib from 'amqplib';
import { requireJsonContent } from '@vigilant-broccoli/express';

const router = Router();

const emailService = new EmailService();
const textMessageService = new TextMessageService();

router.post('/send-email-message', async (req: Request, res: Response) => {
  const { from, to, subject, text, html } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'to and subject are required' });
  }

  const result = await emailService.sendEmail({
    from,
    to,
    subject,
    text,
    html,
  });

  return res.json({
    success: true,
    messageId: result.messageId,
  });
});

router.post('/send-text-message', async (req: Request, res: Response) => {
  const { body, from, to } = req.body;

  if (!body || !from || !to) {
    return res.status(400).json({ error: 'body, from, and to are required' });
  }

  const result = await textMessageService.sendTextMessage({
    body,
    from,
    to,
  });

  return res.json({
    success: true,
    sid: result.sid,
  });
});

router.post(
  '/contact/send-message',
  requireJsonContent,
  async (req: Request, res: Response, _next) => {
    const messageRequest = req.body as MessageRequest;
    const RABBITMQ_CONNECTION_STRING = getEnvironmentVariable(
      'RABBITMQ_CONNECTION_STRING',
    );
    const connection = await amqplib.connect(RABBITMQ_CONNECTION_STRING);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE.EMAIL, { durable: true });
    channel.sendToQueue(
      QUEUE.EMAIL,
      Buffer.from(JSON.stringify(messageRequest)),
      {
        persistent: true,
      },
    );
    console.log(`📤 Queued Message from: ${messageRequest.email}`);
    setTimeout(() => {
      connection.close();
    }, 500);
    res.json({ success: true });
  },
);

export default router;
