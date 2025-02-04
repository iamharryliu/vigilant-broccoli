import { RecaptchaService } from './recaptcha.service';

global.fetch = jest.fn();
jest.mock('@vigilant-broccoli/common-node', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('RecaptchaService', () => {
  let recaptchaService: RecaptchaService;

  beforeEach(() => {
    recaptchaService = new RecaptchaService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance of EmailService', () => {
      expect(recaptchaService).toBeInstanceOf(RecaptchaService);
    });
  });

  describe('isTrustedRequest', () => {
    it('should return true for valid token', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ score: 0.5 }),
      });
      const token = 'valid_token';
      const result = await recaptchaService.isTrustedRequest(token);
      expect(fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_V3_SECRET_KEY}&response=${token}`,
        },
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ score: 0.2 }),
      });
      const token = 'invalid_token';
      const result = await recaptchaService.isTrustedRequest(token);
      expect(fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_V3_SECRET_KEY}&response=${token}`,
        },
      );
      expect(result).toBe(false);
    });
  });
});
