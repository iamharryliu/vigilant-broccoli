import { NewsletterService } from './services/newsletter.service';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  GENERAL_ERROR_CODE,
  MessageRequest,
  ResponseError,
} from '@prettydamntired/personal-website-lib';
import amqplib from 'amqplib';
import { QUEUE, getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export class Controller {
  static async subscribeEmail(req, res, next) {
    const email = req.body.email;
    try {
      if (!email) {
        const err = new Error(
          GENERAL_ERROR_CODE.EMAIL_IS_REQUIRED,
        ) as ResponseError;
        err.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
        throw err;
      }
      const message = await NewsletterService.subscribeEmail(email);
      res.json({
        message: message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifySubscription(req, res, next) {
    const { token } = req.body;
    try {
      if (await NewsletterService.verifyEmail(token)) {
        res.json({ message: 'Email has been verified.' });
      }
      const err = new Error(
        GENERAL_ERROR_CODE.EMAIL_DOES_NOT_EXIST,
      ) as ResponseError;
      err.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
      throw err;
    } catch (error) {
      next(error);
    }
  }

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
