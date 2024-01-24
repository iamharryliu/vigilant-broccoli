export class RecapchaService {
  static async isTrustedRequest(token: string) {
    return fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_V3_SECRET_KEY}&response=${token}`,
    })
      .then((response) => response.json())
      .then((json) => {
        const { score } = json;
        return score > 0.3;
      });
  }
}
