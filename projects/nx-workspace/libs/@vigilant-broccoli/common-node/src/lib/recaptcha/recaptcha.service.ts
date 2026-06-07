import { logger } from '../logging/logger.service';
import { getEnvironmentVariable } from '../utils';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
export class RecaptchaService {
  secretKey: string;

  constructor(secretKey = undefined) {
    this.secretKey =
      secretKey || getEnvironmentVariable('RECAPTCHA_V3_SECRET_KEY');
    if (!this.secretKey) {
      logger.error('RecaptchaService is not configured properly.');
    }
  }

  async isTrustedRequest(token: string): Promise<boolean> {
    return fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.FORM,
      body: `secret=${this.secretKey}&response=${token}`,
    })
      .then(response => response.json())
      .then(json => {
        const { score } = json;
        return score >= 0.5;
      });
  }
}
