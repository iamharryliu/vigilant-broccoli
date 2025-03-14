import http from 'http';
import https from 'https';
import { DEFAULT_EMAIL_REQUEST } from '../email/email.consts';
import { EmailService } from '../email/email.service';
import { logger } from '../logging/logger.service';

export class SiteMonitor {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async monitorSiteActivity(site: string): Promise<void> {
    await SiteMonitor.getSiteStatus(site).then(async status => {
      let message = `${site} is OK.`;
      if (!status) {
        message = `${site} is currently down.`;
        const subject = message;
        await this.emailService.sendEmail({
          ...DEFAULT_EMAIL_REQUEST,
          subject,
          text: message,
        });
      }
      logger.info(message);
    });
  }

  static getSiteStatus(url: string): Promise<boolean> {
    return new Promise((resolve, _) => {
      let requestType;
      if (url.startsWith('https')) {
        requestType = https;
      } else requestType = http;
      requestType
        .get(url, function (res) {
          res.resume();
          resolve(res.statusCode === 200);
        })
        .on('error', function (_) {
          resolve(false);
        });
    });
  }
}
