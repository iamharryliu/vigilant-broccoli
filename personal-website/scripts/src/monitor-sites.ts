import { SiteMonitor } from '../../../node/tools/src';
import { PERSONAL_WEBSITE_URL } from '../../common/src';

const sites = [
  PERSONAL_WEBSITE_URL.BACKEND,
  PERSONAL_WEBSITE_URL.FRONTEND,
  PERSONAL_WEBSITE_URL.FRONTEND_REDIRECTED,
];

main();
async function main() {
  console.log('Site monitor script started.');
  await Promise.all(sites.map(SiteMonitor.monitorSiteActivity));
  console.log('Site monitor script completed.');
}
