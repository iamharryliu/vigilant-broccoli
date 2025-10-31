import { Twilio } from 'twilio';
import {
  MessageInstance,
} from 'twilio/lib/rest/api/v2010/account/message';
import { logger } from '../logging/logger.service';
import { getEnvironmentVariable } from '../../index';

export class TextMessageService {
  private client: Twilio;

  constructor(accountSid?: string, authToken?: string) {
    accountSid = accountSid || getEnvironmentVariable('TWILIO_ACCOUNT_SID');
    authToken = authToken || getEnvironmentVariable('TWILIO_AUTH_TOKEN');
    if (!accountSid || !authToken) {
      logger.error('TextService is not configured properly.');
    }
    this.client = new Twilio(accountSid, authToken);
  }

  sendTextMessage(
    textMessage: {
      body: string,
      from: string,
      to: string,
    },
  ): Promise<MessageInstance> {
    return this.client.messages.create(textMessage);
  }
}
