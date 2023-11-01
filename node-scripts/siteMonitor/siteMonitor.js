import https from 'https';
import MailService from '../mailService/mailService.js';

const sites = [
  process.env.PERSONAL_WEBSITE_FRONTEND_URL,
  process.env.PERSONAL_WEBSITE_BACKEND_URL,
];

const mailService = new MailService(
  'gmail',
  process.env.MY_EMAIL,
  process.env.MY_EMAIL_PASSWORD,
);

checkSiteStatuses();

async function checkSiteStatuses() {
  for (let site of sites) {
    const status = await getSiteStatus(site);
    console.log(`Status for ${site}: ${status}`);
    if (!status) {
      const email = process.env.MY_EMAIL;
      const subject = `The site ${site} is currently down.`;
      const message = `The site ${site} is currently down.`;
      mailService.sendEmail(email, subject, message);
    }
  }
}

function getSiteStatus(url) {
  return new Promise((resolve, _) => {
    https
      .get(url, function (res) {
        resolve(res.statusCode === 200);
      })
      .on('error', function (_) {
        resolve(false);
      });
  });
}
