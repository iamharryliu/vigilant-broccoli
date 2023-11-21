import http from 'http';
import https from 'https';
import MailService from  '../mail-service/mail.service'
import { DEFAULT_EMAIL_REQUEST } from  '../mail-service/mail.model'

const sites = [
  'https://vigilant-broccoli.pages.dev/',
  'https://old-wind-7127.fly.dev/',
];

async function main() {
  for (const site of sites) {
    const status = await getSiteStatus(site);
    let text = `${site} is OK.`;
    if (!status) {
      text = `${site} is currently down.`;
      const subject = text;
      MailService.sendEmail(
        {
          ...DEFAULT_EMAIL_REQUEST,
          subject,
          text,
        });
    }
    console.log(text);
  }
}

// TODO: end promise to end script
function getSiteStatus(url: string) {
  return new Promise((resolve, _) => {
    let requestType;
    if (url.startsWith('https')) {
      requestType = https;
    } else requestType = http;
    requestType
      .get(url, function (res) {
        resolve(res.statusCode === 200);
      })
      .on('error', function (_) {
        resolve(false);
      });
  });
}

main();
