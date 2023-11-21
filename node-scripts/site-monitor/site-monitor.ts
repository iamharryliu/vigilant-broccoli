import http from 'http';
import https from 'https';
import MailService from '@prettydamntired/mailservice'

const sites = [
  'https://vigilant-broccoli.pages.dev/',
  'https://old-wind-7127.fly.dev/',
];

const mailService = new MailService();

async function main() {
  for (const site of sites) {
    const status = await getSiteStatus(site);
    let message = `${site} is OK.`;
    if (!status) {
      message = `${site} is currently down.`;
      const email = process.env.MY_EMAIL;
      const subject = message;
      mailService.sendEmail(email, subject, message);
    }
    console.log(message);
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
