import {
  MessageRequest,
} from '@prettydamntired/personal-website-lib';
import amqplib from 'amqplib';
import { QUEUE, getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export class Controller {
  static async sendMessage(req, res, next) {
    try {
      const messageRequest = req.body as MessageRequest;
      const RABBITMQ_CONNECTION_STRING =
        getEnvironmentVariable('RABBITMQ_CONNECTION_STRING');
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
    } catch (error) {
      next(error);
    }
  }
}
