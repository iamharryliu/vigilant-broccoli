import 'dotenv-defaults/config';
import { Twilio } from 'twilio';
import {
  MessageInstance,
  MessageListInstanceCreateOptions,
} from 'twilio/lib/rest/api/v2010/account/message';
import { DEFAULT_TEXT_MESSAGE } from './text-message.const';
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
    textMessage = DEFAULT_TEXT_MESSAGE as MessageListInstanceCreateOptions,
  ): Promise<MessageInstance> {
    return this.client.messages.create(textMessage);
  }
}
