import { Router, Request, Response } from 'express';
import { EmailService } from '@vigilant-broccoli/common-node';
import { TextMessageService } from '@vigilant-broccoli/common-node';

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

export default router;
