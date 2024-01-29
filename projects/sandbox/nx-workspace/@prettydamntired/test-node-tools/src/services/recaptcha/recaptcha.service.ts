import 'dotenv-defaults/config';
export class RecapchaService {
  secretKey: string;

  constructor(recaptchaV3SecretKey = undefined) {
    this.secretKey =
      recaptchaV3SecretKey || process.env.RECAPTCHA_V3_SECRET_KEY;
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
