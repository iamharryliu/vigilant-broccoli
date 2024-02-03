import { RecapchaService } from './recaptcha.service';

describe('RecapchaService', () => {
  it('should be created', () => {
    const recaptchaService = new RecapchaService();
    expect(recaptchaService).toBeTruthy();
  });
});
