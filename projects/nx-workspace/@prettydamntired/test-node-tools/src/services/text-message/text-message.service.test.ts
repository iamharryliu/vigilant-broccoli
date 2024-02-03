import { TextMessageService } from './text-message.service';

describe('TextMessageService', () => {
  it('should be created', () => {
    const textMessageService = new TextMessageService();
    expect(textMessageService).toBeTruthy();
  });
});
