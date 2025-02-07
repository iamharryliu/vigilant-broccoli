import { MessageRequest } from '@prettydamntired/personal-website-lib';
import { DEFAULT_APP_EMAIL_CONFIG } from '@prettydamntired/personal-website-api-lib';
import amqplib from 'amqplib';
import { Email, EmailService } from '@vigilant-broccoli/common-node';

async function sendMessage(request: MessageRequest) {
  const email = {
    ...DEFAULT_APP_EMAIL_CONFIG[request.appName],
    ...request,
  } as Email;
  const { from, to, subject, text, html } = email;
  const mailService = new EmailService();
  await mailService.sendEmail({
    from,
    to,
    subject,
    text,
    html,
  });
}

async function receiveMessage() {
  try {
    const QUEUE = process.env.RABBITMQ_QUEUE || '';
    const RABBITMQ_CONNECTION_STRING =
      process.env.RABBITMQ_CONNECTION_STRING || '';
    const connection = await amqplib.connect(RABBITMQ_CONNECTION_STRING);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`📥 Waiting for messages in ${QUEUE}...`);
    channel.consume(
      QUEUE,
      msg => {
        if (msg) {
          console.log(`✅ Received: ${msg.content.toString()}`);
          channel.ack(msg);
          sendMessage(JSON.parse(msg.content.toString()));
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

receiveMessage();
