import http from 'http';
import https from 'https';
import { EmailService } from '../services/email.service';
import { DEFAULT_EMAIL_REQUEST } from '../consts/email.const';

export class SiteMonitor {
  static async monitorSiteActivity(site: string) {
    await SiteMonitor.getSiteStatus(site).then(status => {
      let message = `${site} is OK.`;
      if (!status) {
        message = `${site} is currently down.`;
        const subject = message;
        EmailService.sendEmail({
          ...DEFAULT_EMAIL_REQUEST,
          subject,
          text: message,
        });
      }
      console.log(message);
    });
  }
  static getSiteStatus(url: string) {
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
