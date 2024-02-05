import 'dotenv-defaults/config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { DEFAULT_TEXT_MESSAGE } from '../../consts/text-message.const';

export class TextMessageService {
  private client: Twilio;

  constructor(accountSid = undefined, authToken = undefined) {
    accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID;
    authToken = authToken || process.env.TWILIO_AUTH_TOKEN;
    this.client = new Twilio(accountSid, authToken);
  }

  sendTextMessage(
    textMessage = DEFAULT_TEXT_MESSAGE,
  ): Promise<MessageInstance> {
    return this.client.messages.create(textMessage);
  }
}
