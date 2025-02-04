import 'dotenv-defaults/config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { DEFAULT_TEXT_MESSAGE } from './text-message.const';
import { logger } from '../logging/logger.service';

export class TextMessageService {
  private client: Twilio;

  constructor(accountSid = undefined, authToken = undefined) {
    accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID;
    authToken = authToken || process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      logger.error('TextService is not configured properly.');
    }
    this.client = new Twilio(accountSid, authToken);
  }

  sendTextMessage(
    textMessage = DEFAULT_TEXT_MESSAGE,
  ): Promise<MessageInstance> {
    return this.client.messages.create(textMessage);
  }
}
