import ejs from 'ejs';
import {
  DEFAULT_EJS_TEMPLATE,
  DEFAULT_EMAIL_REQUEST,
} from '../../consts/email.const';
import { EmailService } from './email.service';

jest.mock('../logging/logger.service', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService('your-email@example.com', 'your-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance of EmailService', () => {
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('sendEmail', () => {
    it('should send plain text email', async () => {
      jest
        .spyOn(emailService['transporter'], 'sendMail')
        .mockResolvedValueOnce({} as any);
      const result = await emailService.sendEmail(DEFAULT_EMAIL_REQUEST);
      expect(result).toBeDefined();
    });
  });

  describe('sendEjsEmail', () => {
    it('should send HTML email using EJS template', async () => {
      jest
        .spyOn(ejs, 'renderFile')
        .mockResolvedValueOnce('Mocked HTML Content');
      jest
        .spyOn(emailService['transporter'], 'sendMail')
        .mockResolvedValueOnce({} as any);
      const result = await emailService.sendEjsEmail(
        DEFAULT_EMAIL_REQUEST,
        DEFAULT_EJS_TEMPLATE,
      );
      expect(result).toBeDefined();
    });
  });
});
