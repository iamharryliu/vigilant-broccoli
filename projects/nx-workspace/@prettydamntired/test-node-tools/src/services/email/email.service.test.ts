import { EmailService } from './email.service';

describe('EmailService', () => {
  it('should be created', () => {
    const emailService = new EmailService();
    expect(emailService).toBeTruthy();
  });
});
