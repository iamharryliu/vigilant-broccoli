import 'dotenv-defaults/config';
import { logger } from '@vigilant-broccoli/common-node';
export class RecaptchaService {
  secretKey: string;

  constructor(secretKey = undefined) {
    this.secretKey = secretKey || process.env.RECAPTCHA_V3_SECRET_KEY;
    if (!this.secretKey) {
      logger.error('RecaptchaService is not configured properly.');
    }
  }

  async isTrustedRequest(token: string): Promise<boolean> {
    return fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${this.secretKey}&response=${token}`,
    })
      .then(response => response.json())
      .then(json => {
        const { score } = json;
        return score > 0.3;
      });
  }
}
