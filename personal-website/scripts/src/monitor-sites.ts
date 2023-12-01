import { SiteMonitor } from '@prettydamntired/node-tools';
import { PERSONAL_WEBSITE_URL } from '../../common/src';

const sites = [
  PERSONAL_WEBSITE_URL.BACKEND,
  PERSONAL_WEBSITE_URL.FRONTEND,
  PERSONAL_WEBSITE_URL.FRONTEND_REDIRECTED,
];

main();
async function main() {
  await Promise.all(sites.map(SiteMonitor.monitorSiteActivity));
}
