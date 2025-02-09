/* eslint-disable-next-line @nx/enforce-module-boundaries */
import { SiteMonitor } from '../common-node/src';

const sites = [
  'https://harryliu.dev/',
  'https://api.harryliu.dev/',
  'https://vibecheck-lite-express.fly.dev/',
  'https://vibecheck-angular.harryliu.dev/',
  'https://vibecheck-flask.harryliu.dev/',
  // ...Object.values(TODO_SITE),
];

async function main() {
  const siteMonitor = new SiteMonitor();
  await Promise.all(sites.map(site => siteMonitor.monitorSiteActivity(site)));
}

main();
