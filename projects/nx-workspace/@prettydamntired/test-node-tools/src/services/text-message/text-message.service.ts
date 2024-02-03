import 'dotenv-defaults/config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { TextMessage } from '../../models/text-message.model';

export class TextMessageService {
  private client: Twilio;

  constructor(accountSid = undefined, authToken = undefined) {
    accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID;
    authToken = authToken || process.env.TWILIO_AUTH_TOKEN;
    this.client = new Twilio(accountSid, authToken);
  }

  sendTextMessage(textMessage: TextMessage): Promise<MessageInstance> {
    return this.client.messages.create(textMessage);
  }
}
